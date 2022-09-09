"use babel";

/**
* Original authors:
* Cornell University CS 5150 Spring 2018
* Extend The Atom Project Team
* Team members:
* Saqif Badruddin <ssb229@cornell.edu>
* Joseph Chuang <jcc436@cornell.edu>
* Weiyou Dai <wd248@cornell.edu>
* Jianhua Fan <jf773@cornell.edu>
* Daniel Jordan Hirsch <djh329@cornell.edu>
* Athena Danlu Huang <dh527@cornell.edu>
* Tyler Yeung Ishikawa <tyi3@cornell.edu>
* Jacob Ethan Rauch <jer322@cornell.edu>
*/

/**
* This package enables users to configure per-project settings using an
* .atom/config.cson file.
*/

const fs = require("fs");
const glob = require("glob");
const CSON = require("season");
const path = require("path");
const mergeJSON = require("merge-json");

import { PROJECT_CONFIG_PATH } from "./constants";
import { CompositeDisposable, BufferedProcess } from "atom";

import RootController from "./views/root-controller";

import React from "react";
import ReactDom from "react-dom";

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.projectConfigs = [];
    this.disabledConfigs = [];

    this.currentlyInstallingPackages = new Set();
    this.menuRef = {};
    this.configCache = new Map()

    // Register commands that reset the configuration if available and open the
    // configuration file if exists. The commands should be available in the
    // Packages dropdown menu.
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "atomic-management:open-window-config": () => this.toggleSettingsMenu(),
        "atomic-management:reset-remembered-window-config": () => this.resetState(),
        "atomic-management:toggle-require-configured-packages": () => this.toggleEnforceConfiguredPackages()
      }),

      // Register event handler to set project config when projects are
      // added/removed from the window
      atom.project.onDidChangePaths(paths => {
        this.initConfigs();
      }),

      // Register event handler to set project config when current config file
      // is saved and cache when anything is changed.
      atom.project.onDidChangeFiles(events => {
        events.forEach(e => {
          if (e.path.endsWith(PROJECT_CONFIG_PATH)) {
            this.configCache.delete(e.path);

            if (e.action === "deleted") {
              const index = this.projectConfigs.indexOf(e.path);
              this.projectConfigs.splice(index, 1);
            }

            this.initConfigs();
          } else if (e.action === "renamed" && e.oldPath.endsWith(PROJECT_CONFIG_PATH)) {
            const index = this.projectConfigs.indexOf(e.oldPath);
            this.projectConfigs.splice(index, 1);

            this.initConfigs();
          }
        });
      })
    );
  },

  deactivate() {
    this.restoreGlobalConfig();
    this.subscriptions.dispose();
    if (this.tile != null) {
      this.tile.destroy();
    }
    if (this.tooltips && typeof(this.tooltips.dispose) === "function") {
      this.tooltips.dispose();
    }
  },

  serialize() {
    return;
  },

  consumeStatusBar(statusBar) {
    this.element = document.createElement("div");
    this.element.id = "renderPanel";
    this.statusBar = statusBar;
    this.tooltips = atom.tooltips;
    this.tile = this.statusBar.addLeftTile({
      item: this.element,
      priority: 100
    });
    this.themelistener = atom.themes.onDidChangeActiveThemes(() => {
      ReactDom.render(
        <RootController
          statusBar={this.statusBar}
          tooltips={this.tooltips}
          projectConfigs={this.projectConfigs}
          disabledConfigs={this.disabledConfigs}
          onReorder={this.reorderConfigs.bind(this)}
          onCheck={this.onEnableDisableConfig.bind(this)}
          menuRef={this.menuRef}
        />,
        this.element,
        this.startUp.bind(this)
      );
    });
  },

  updateStatusBar() {
    if (this.tile) {
      this.tile.destroy();
    }
    if (!this.element) {
      this.element = document.createElement("div");
    }
    if (this.statusBar) {
      ReactDom.render(
        <RootController
          statusBar={this.statusBar}
          tooltips={this.tooltips}
          projectConfigs={this.projectConfigs}
          disabledConfigs={this.disabledConfigs}
          onReorder={this.reorderConfigs.bind(this)}
          onCheck={this.onEnableDisableConfig.bind(this)}
          menuRef={this.menuRef}
        />,
        this.element
      );
    }
  },

  startUp() {
    this.initConfigs();
    if (this.themelistener) {
      this.themelistener.dispose();
    }
  },

  /**
  * Sets the window's configuration based on the opened projects. If multiple
  * projects in this window have their own configuration files, the user will
  * be given the option to choose between the configurations.
  */
  initConfigs() {
    var projectPaths = atom.project.getPaths();

    if (
      this.projectConfigs &&
      this.projectConfigs.length === projectPaths.length
    ) {
      projectPaths = this.projectConfigs;
    } else {
      this.projectConfigs = [];
    }

    projectPaths.forEach(projectPath => {
      var config = glob.sync(`${projectPath}/${PROJECT_CONFIG_PATH}`);
      if (config.length !== 0) {
        this.projectConfigs.push(config[0]);
      }
    });

    if (this.projectConfigs.length === 0) {
      this.restoreGlobalConfig();
    } else {
      this.loadConfigs();
    }
  },

  /**
  * Merge all config.cson detected in all open project.
  * Upper projects take precedence over lower ones if there are conflicting entries.
  */
  loadConfigs() {
    var activeConfigs = this.projectConfigs.filter( (config) => !this.disabledConfigs.includes(config) );
    var mergedConfig = {};

    const installedPackageNames = new Set(
      atom.packages.getAvailablePackageNames()
    );
    const notInstalledPackages = new Map();

    activeConfigs.forEach(configName => {
      let contents;
      if (!this.configCache.has(configName)) {
        this.cacheConfigFile(configName);
      }
      contents = this.configCache.get(configName);

      if (contents === undefined) {
        contents = {};
      } else {
        const tokens = {
          "PROJECT_PATH": path.dirname(path.dirname(configName))
        };

        let json_string = JSON.stringify(contents);
        for (let key in tokens) {
          const regex = new RegExp(`\\$\{${key}}`, "g");
          json_string = json_string.replace(regex, tokens[key]);
        }

        contents = JSON.parse(json_string);
      }

      contents = this.standardizeConfig(contents);
      // note down all packages that are configured but not installed
      for (let toplevel in contents) {
        for (let pname in contents[toplevel]) {
          if (
            pname !== "core" &&
            pname !== "editor" &&
            !installedPackageNames.has(pname)
          ) {
            if (!notInstalledPackages.has(pname)) {
              notInstalledPackages.set(pname, []);
            }

            notInstalledPackages.get(pname).push(configName);
          }
        }
      }

      mergedConfig = mergeJSON.merge(contents, mergedConfig);
    });

    this.getDisabledPackages(mergedConfig).forEach((pname, index) => {
      if(!installedPackageNames.has(pname)) {
        mergedConfig['*'].core.disabledPackages.splice(index, 1)
      }
    })

    if (notInstalledPackages.size !== 0) {
      this.checkPackages(notInstalledPackages);
    }
    this.configContents = mergedConfig;
    atom.config.resetProjectSettings(
      mergedConfig,
      this.projectConfigs[0] || atom.config.mainSource
    );
    this.updateStatusBar();
  },

  /** Function to be called on reordering of project settings
  * newOrder is the full paths of projects in their new order of priority
  */
  reorderConfigs(newConfigs) {
    this.projectConfigs = newConfigs;
    this.loadConfigs();
  },

  cacheConfigFile(configName) {
    var contents;
    try {
      contents = CSON.readFileSync(configName);
    } catch (e) {
      console.error(e);

      // TODO: Add button to edit config.
      atom.notifications.addWarning(
        "Failed read project config:\n\n" +
        `${configName}\n\n` +
        "Please check the config file. Restoring global config.cson.",
        {
          dismissable: true
        }
      );
      return;
    }
    if(contents) {
      this.configCache.set(configName,contents)
    }
  },

  /**
  * Returns a string array of names of disabled packages specified in the given
  * configuration object.
  *
  * @param {Object} config An Atom configuration object
  */
  getDisabledPackages(config) {
    if (config) {
      config = this.standardizeConfig(config);

      if (config["*"].core && config["*"].core.disabledPackages) {
        return config["*"].core.disabledPackages;
      }
    }
    return [];
  },

  /**
  * Adds global namespace to configuration object if it does not use
  * namespaces.
  *
  * @param {Object} config A configuration object
  */
  standardizeConfig(config) {
    if ("*" in config) {
      return config;
    } else {
      return { "*": config };
    }
  },

  /**
  * Unsets the local project configuration and restores the global
  * configuration.
  */
  restoreGlobalConfig() {
    atom.config.resetProjectSettings({}, true);
    atom.config.clearProjectSettings();
    this.updateStatusBar();
  },

  /**
  * Resets the default configuration file for the current window.
  */
  resetState() {
    this.disabledConfigs = [];
    this.initConfigs();
  },

  toggleEnforceConfiguredPackages() {
    let old = atom.config.get("atomic-management.enforceConfiguredPackages");
    atom.config.set("atomic-management.enforceConfiguredPackages", !old);
  },

  /** Toggles the Gear-setting menu in the lower left*/
  toggleSettingsMenu() {
    if (this.menuRef.click) {
      this.menuRef.click();
    }
  },

  /** Function to be called when a check box of the status bar gui is
  * clicked. Gets passed index of projectConfigs of the file that was changed
  * and the state of all checkboxes, prior to this change, where the last element
  * is */
  onEnableDisableConfig(index, checked) {
    // If the config file is currently impactful, remove it
    this.projectConfigs.forEach((file, ind) => {
      if (checked[ind]) {
        this.disabledConfigs = this.disabledConfigs.filter(config => config !== file);
      } else {
        this.disabledConfigs.push(file);
      }
    });
    var promise = new Promise((resolve, reject) => {
      this.loadConfigs();
      resolve()
    })
  },

  /**
  * Instructs the user on how to install the specified packages.
  *
  * @param {Array<String>} packageNames The names of packages that are not
  *                                     installed currently
  * @param {String} customDescription A custom message to the user
  */
  askInstallPackages(packageNames, customDescription = null) {
    const message = "Install Configured Packages";
    const description =
      customDescription !== null
        ? customDescription
        : "The following packages are configured in the local project " +
          "configuration file(s) but are not installed. Would you like to " +
          "install these packages now?\n\n" +
          packageNames.map(name => `- ${name}`).join("\n");

    const notification = atom.notifications.addWarning(message, {
      description,
      dismissable: true,
      buttons: [
        {
          text: "Install Packages",
          onDidClick: () => {
            this.installPackages(packageNames);
            notification.dismiss();
          }
        },
        {
          text: "Ignore",
          onDidClick: () => {
            notification.dismiss();
          }
        }
      ]
    });
  },

  /**
  * Prompts the user to reload the window.
  *
  * @param {String} message The title of the notification
  * @param {String} description The details of the notification
  */
  askReloadAtom(message, description) {
    var notification = atom.notifications.addInfo(message, {
      description: description,
      buttons: [
        {
          text: "Reload Now",
          onDidClick: () => {
            atom.reload();
          }
        },
        {
          text: "Ignore",
          onDidClick: () => {
            notification.dismiss();
          }
        }
      ],
      dismissable: true
    });
  },

  /**
  * Alert the user that the specified packages are invalid, and give them the
  * option to open up the config files where these packages are specified.
  *
  * @param {Array<String>} packageNames The names of packages that are invalid
  * @param {Array<String>} configFiles The paths to config files where the
  *                                    packages are specified
  *
  */
  alertBadPackages(packageNames, configFiles) {
    const message = "Invalid Package Names";
    const description =
      "The following packages are configured in the local project " +
      "configuration file(s) but are not known packages. Would you like to " +
      "open the configuration file(s) to fix this?\n\n" +
      packageNames.map(name => `- ${name}`).join("\n");

    const notification = atom.notifications.addWarning(message, {
      description,
      dismissable: true,
      buttons: [
        {
          text: "Open Configuration File(s)",
          onDidClick: () => {
            configFiles.forEach(filename => atom.workspace.open(filename));
            notification.dismiss();
          }
        },
        {
          text: "Ignore",
          onDidClick: () => {
            notification.dismiss();
          }
        }
      ]
    });
  },

  /**
  * Checks existence of packages specified using apm view. Will silently ignore
  * any package names that contain spaces, because that is invalid.
  *
  * @param {Map<String, Array<String>>} packagesMap
  *   A map where the keys are packages that are not installed and the values
  *   are arrays of config filenames that configure that package
  */
  checkPackages(packagesMap) {
    // No need to check packages that are being installed
    this.currentlyInstallingPackages.forEach(name => {
      packagesMap.delete(name);
    });

    // Separate by whether or not there is a space in the name
    const spacelessPackageNames = [];
    const badPackageNames = [];

    for (let [key, value] of packagesMap) {
      if (key.indexOf(" ") === -1) {
        spacelessPackageNames.push(key);
      } else {
        badPackageNames.push(key);
      }
    }

    this.runApmCommand("view", spacelessPackageNames).then(
      ([successful, unsuccessful]) => {
        badPackageNames.push(...unsuccessful);

        if (!atom.config.get("atomic-management.enforceConfiguredPackages")) {
          return;
        }

        if (successful.length > 0) {
          this.askInstallPackages(successful);
        }
        if (badPackageNames.length > 0) {
          const badPackageConfigFiles = new Set();

          badPackageNames.forEach(name => {
            packagesMap
              .get(name)
              .forEach(configFile => badPackageConfigFiles.add(configFile));
          });

          this.alertBadPackages(
            badPackageNames,
            Array.from(badPackageConfigFiles)
          );
        }
      }
    );
  },

  /**
  * Installs the packages specified using apm install.
  *
  * @param {Array<String>} packageNames The package names to install. Must be
  *                                     valid, existing packages.
  */
  installPackages(packageNames) {
    if (packageNames.length === 0) {
      return;
    }

    this.currentlyInstallingPackages = new Set();
    packageNames.forEach(name => this.currentlyInstallingPackages.add(name));

    this.runApmCommand("install", packageNames).then(
      ([successful, unsuccessful]) => {
        packageNames.forEach(name =>
          this.currentlyInstallingPackages.delete(name)
        );

        if (successful.length > 0) {
          const message = "Reload to Use Packages";
          const detail =
            "The following packages have been installed successfully:\n\n" +
            successful.map(name => `- ${name}`).join("\n") +
            "\n\n" +
            "Would you like to reload the window to begin using these packages?";

          this.askReloadAtom(message, detail);
        }
        if (unsuccessful.length > 0) {
          const err =
            "These packages could not be installed (this could be due to " +
            "a network error).\n\n" +
            unsuccessful.map(name => `- ${name}`).join("\n") +
            "\n\n" +
            "Would you like to retry the installation of these packages?";

          this.askInstallPackages(unsuccessful, err);
        }
      }
    );
  },

  /**
  * Runs the given apm command and returns a Promise containing two arrays -
  * the first containing names of packages that successfully ran the command
  * and the second containing names of packages that unsuccessfully ran the
  * command.
  *
  * @param {String} apmCommand The apm command to run
  * @param {Array<String>} packageNames The names of packages to run this
  *                                     command on.
  */
  runApmCommand(apmCommand, packageNames) {
    // Separate by whether or not there is a space in the name
    const spacelessPackageNames = packageNames.filter(
      name => name.indexOf(" ") === -1
    );
    const badPackageNames = packageNames.filter(
      name => name.indexOf(" ") !== -1
    );

    const apmPromises = [];

    const command = atom.packages.getApmPath();
    const stdout = output => null; // don't need command output

    spacelessPackageNames.forEach(name => {
      const args = [apmCommand, name];

      let exit;
      const myPromise = new Promise((resolve, reject) => {
        exit = code => {
          resolve({ packageName: name, code: code });
        };
      });

      apmPromises.push(myPromise);

      const process = new BufferedProcess({ command, args, stdout, exit });
    });

    return Promise.all(apmPromises).then(allResults => {
      const successful = allResults
        .filter(r => r.code === 0)
        .map(r => r.packageName);

      const unsuccessful = allResults
        .filter(r => r.code !== 0)
        .map(r => r.packageName);

      unsuccessful.push(...badPackageNames);

      return [successful, unsuccessful];
    });
  }
};
