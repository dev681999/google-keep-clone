import React, { Component } from 'react';
import Color from './Color';
import { Button, InputBase, GridList, GridListTile, Card, CardContent } from '@material-ui/core';

class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: props.note.title || '',
            content: props.note.content || ''
        }
    }

    render() {
        let classes = '';

        // Color
        if (this.props.note.color) {
            // alert(this.state.color)
            classes += ` ${this.props.note.color}`;
        }

        const styles = {
            width: 600,
            maxWidth: 600,
            textAlign: 'left',
            // backgroundColor: this.state.color,
        };

        return (
            <form
                onSubmit={e => {
                    e.preventDefault();
                    this.props.handleClose();
                    if (!this.state.title && !this.state.content) {
                        return false;
                    }


                }}>
                <Card style={styles} className={classes}>
                    <CardContent >
                        <InputBase
                            placeholder="Title"
                            hintStyle={{ fontSize: 16, fontWeight: 800 }}
                            inputStyle={{ fontSize: 16, fontWeight: 800 }}
                            fullWidth={true}
                            underlineShow={false}
                            value={this.state.title}
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                        <br />
                        <InputBase
                            placeholder="Take a note..."
                            hintStyle={{ fontSize: 14 }}
                            inputStyle={{ fontSize: 14 }}
                            fullWidth={true}
                            underlineShow={false}
                            multiline={true}
                            rows={1}
                            rowsMax={10}
                            value={this.state.content}
                            onChange={(e) => this.setState({ content: e.target.value })}
                        />
                        <div style={{ textAlign: 'right', marginBottom: -20, marginRight: -10, marginLeft: -10 }}>
                            <div style={{ margin: 4, fontStyle: 'italic', fontSize: 14 }}>
                                <small>Edited on {new Date(this.props.note.modifiedAt).toLocaleString()}</small>
                            </div>
                            <GridList cellHeight='auto'>
                                <GridListTile style={{ textAlign: 'left' }}>
                                    <Color note={this.props.note} />
                                </GridListTile>
                                <GridListTile style={{ textAlign: 'right' }}>
                                    <Button
                                        onClick={e => {
                                            e.preventDefault();
                                            this.props.handleClose();
                                            if (!this.state.title && !this.state.content) {
                                                return false;
                                            }

                                            this.props.changeMain(this.props.note.id, this.state.title, this.state.content, this.props.note.color);
                                        }}
                                        variant="text"
                                        label="Done"
                                        type="submit"
                                    >Done</Button>
                                </GridListTile>
                            </GridList>
                        </div>
                    </CardContent>
                </Card>
            </form>
        )
    }
}

export default (Editor);