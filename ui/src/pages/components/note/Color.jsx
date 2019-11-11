import React, { Component } from 'react';
import { IconButton, Popover } from '@material-ui/core';
// import PaletteIcon from '@material-ui/icons/Palette';
import IconMenu from '@material-ui/icons/Palette';
// import { ChromePicker, CirclePicker } from 'react-color';

class Color extends Component {
    state = {
        displayColorPicker: false,
        anchorEl: null,
    };

    handleClick = (e) => {
        // console.log('event',e);
        e.stopPropagation();
        this.setState({ displayColorPicker: !this.state.displayColorPicker, anchorEl: this.state.anchorEl === null ? e.currentTarget : null })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false, anchorEl: null })
    };

    constructor(props) {
        super(props);
        this.changeColor = this.changeColor.bind(this);
    }

    changeColor(color) {
        // Callback
        if (this.props.onChange) {
            this.props.onChange(color);
        }
        // Existing Note
        if (this.props.note.id) {
            this.props.changeColor(this.props.note.id, color);
        }
    }

    render() {
        /* const popover = {
            position: 'absolute',
            zIndex: '2',
        }
        const cover = {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        } */

        return (
            <IconButton onClick={this.handleClick}>
                <IconMenu />
                <Popover
                    // id={id}
                    open={this.state.displayColorPicker}
                    anchorEl={this.state.anchorEl}
                    onClose={this.onClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    {/* <CirclePicker style={{height: '100%'}} circleSize={48} colors={['616161', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'magenta', 'purple', 'pink', 'brown', 'gray']} onChangeComplete={(color) => this.props.onChange(color)} /> */}
                    <div style={{ textAlign: 'center' }}>
                        <IconButton onClick={() => this.changeColor('white')} className='color-selector white' />
                        <IconButton onClick={() => this.changeColor('red')} className='color-selector red' />
                        <IconButton onClick={() => this.changeColor('orange')} className='color-selector orange' />
                        <IconButton onClick={() => this.changeColor('yellow')} className='color-selector yellow' />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <IconButton onClick={() => this.changeColor('green')} className='color-selector green' />
                        <IconButton onClick={() => this.changeColor('teal')} className='color-selector teal' />
                        <IconButton onClick={() => this.changeColor('blue')} className='color-selector blue' />
                        <IconButton onClick={() => this.changeColor('dark-blue')} className='color-selector dark-blue' />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <IconButton onClick={() => this.changeColor('purple')} className='color-selector purple' />
                        <IconButton onClick={() => this.changeColor('pink')} className='color-selector pink' />
                        <IconButton onClick={() => this.changeColor('brown')} className='color-selector brown' />
                        <IconButton onClick={() => this.changeColor('gray')} className='color-selector gray' />
                    </div>
                </Popover>

            </IconButton>
        );
    }

}

export default (Color)