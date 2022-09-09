'use babel';

import React, {Component} from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

import {PROJECT_CONFIG_PATH} from '../constants'

export default class StatusBar extends Component {

  static propTypes = {
    statusBar: PropTypes.object.isRequired,
    tooltips: PropTypes.object.isRequired,
    projectConfigs: PropTypes.array.isRequired,
    onReorder: PropTypes.func.isRequired,
    onCheck: PropTypes.func.isRequired,
    disabledConfigs: PropTypes.array.isRequired
  }

  setChecked(projectConfigs, disabledConfigs) {
    var checked = [];
    projectConfigs.forEach((config) => {
      checked.push(!disabledConfigs.includes(config));
    });
    checked.push(true);
    this.setState({checked});
  }

  constructor(props) {
    super(props);
    this.guilist=[];
    var checked=[];

    props.projectConfigs.forEach((file) => {
      checked.push(!props.disabledConfigs.includes(file));
    });
    checked.push(true);
    this.state = {checked};

    this.domNode = document.createElement('div');
    this.domNode.classList.add(`icon-gear`);
    this.domNode.classList.add('inline-block')
    if(this.props.menuRef) {
      this.props.menuRef.click = () => {this.domNode.click()}
    }
  }

  componentDidMount() {
    this.consumeStatusBar()
  }

  consumeStatusBar() {
    if(this.tooltips) {
      this.tooltips.dispose()
    }
    if(this.tile) {
      this.tile.dispose()
    }
    this.domNode = document.createElement('div');
    this.domNode.id='domNode'
    this.domNode.classList.add('inline-block')
    this.buttonTrigger=false

    // Code from GitHub Pacakge
    this.tile = this.props.statusBar.addLeftTile({item: this.domNode, priority: -100});
    this.tooltips = this.props.tooltips.add(this.domNode, {item: this.dummy, trigger: 'click', className:'status-bar-tooltip', class:'status-bar-tooltip'})
  }

  reorder(from, to) {
    var projectNames = this.props.projectConfigs
    projectNames.splice(to, 0, projectNames.splice(from, 1)[0]);
    this.buttonTrigger=true
    this.props.onReorder(projectNames);
  }

  onDrop(e) {
    var droppedOn = e.target.id
    var draggItem = e.dataTransfer.getData("text")
    var to = parseInt(droppedOn);
    var from = parseInt(draggItem);
    this.reorder(from, to)
  }

  onUpArrowClick(index) {
    return(()=> {
      if(index>0) {
        this.reorder(index,index-1)
      }
    })
  }

  onDownArrowClick(index) {
    return (() => {
      if(index < this.props.projectConfigs.length-1) {
        this.reorder(index,index+1)
      }
    })
  }

  onDrag(e) {
    e.dataTransfer.setData("text", e.target.id)
  }

  componentWillReceiveProps(nextProps) {
    this.setChecked(nextProps.projectConfigs, nextProps.disabledConfigs)
  }

  onCheck(index) {
    return (() => {
      this.buttonTrigger=true;
      var checked = this.state.checked
      checked[index] = !checked[index]
      this.props.onCheck(index, checked.slice(0,this.state.checked.length-1));
    })
  }

  componentDidUpdate() {
    var guilist = this.props.projectConfigs.map( (keyO, index) => {
      var split = keyO.split('/');
      var key= split[split.length - 3];
      var name= split[split.length - 1];
      var lightenUp = index == 0 ? 'lighten' : '';
      var lightenDown = index == this.props.projectConfigs.length-1 ? 'lighten' : '';
      return (
        <div
          id={index}
          key={key}
          className='config-pane'
          style={{marginLeft:'5%', display:'inlineBlock'}}
          draggable={true}
          onDragStart={this.onDrag.bind(this)}
          onDragOver={(e) => {e.preventDefault()}}
          onDrop={this.onDrop.bind(this)}>

          <div id={index} className='config-tile'>
            <div>
              <input type='checkbox' id={`myCheck${index}`} checked={this.state.checked[index]} onChange={this.onCheck(index).bind(this)}/>
              <label>{key} (<a onClick={() => {atom.workspace.open(keyO)}}>{name}</a>)</label>
              <span className={`icon-arrow-down ${lightenDown}`} onClick={this.onDownArrowClick(index).bind(this)}/>
              <span className={`icon-arrow-up ${lightenUp} up`} onClick={this.onUpArrowClick(index).bind(this)}/>
            </div>
          </div>
        </div>)
      }
    )

    var globalConfig = atom.config.getUserConfigPath()
    var split = globalConfig.split('/')
    var globalName= split[split.length - 1];
    var element =
    <div
      className="config-status-bar"
      ref={(e) => {this.status_ref=e}}>

      {guilist}
      <div
        className='config-pane'
        style={{marginLeft:'5%'}}
        draggable={false}>

        <div className='config-tile'>
          <div>
            <input disabled type='checkbox' id='myCheckGlobal' checked={this.state.checked[this.state.checked.length - 1]} onChange={() => {return false}}/>
            <label>Global (<a onClick={() => {atom.workspace.open(globalConfig)}}>{globalName}</a>)</label>
          </div>
        </div>
      </div>
    </div>

    ReactDom.render(element, this.dummy, (x) => {
      if(this.tooltips) {
        this.tooltips.dispose()
        this.tooltips = this.props.tooltips.add(this.domNode, {item: this.dummy, trigger: 'click', className:'status-bar-tooltip', class:'status-bar-tooltip'})
        if(this.buttonTrigger) {
          this.domNode.click();
          this.buttonTrigger=false;
        }
      }
    })
  }

  render() {
    this.dummy = document.createElement('div');
    this.dummy.id='dummy'
    return ReactDom.createPortal(
      this.props.children,
      this.domNode,
    );
  }
}
