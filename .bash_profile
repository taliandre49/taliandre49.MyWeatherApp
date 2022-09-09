# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/nelson.jordan/opt/anaconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/nelson.jordan/opt/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/nelson.jordan/opt/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/nelson.jordan/opt/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

# opam configuration
test -r /Users/nelson.jordan/.opam/opam-init/init.sh && . /Users/nelson.jordan/.opam/opam-init/init.sh > /dev/null 2> /dev/null || true
