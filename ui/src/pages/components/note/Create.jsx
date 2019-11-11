import React, { Component } from 'react';
import { Card, CardActions, CardContent, Typography, Button, InputBase, Grid } from '@material-ui/core';
import Color from './Color';
import axios from 'axios';
import config from '../../config';

// import { Card } from '@material-ui/core';
// import { Button, Card, Card } from '@material-ui/core';
// import NoteColor from "../NoteColor/NoteColor";

class Create extends Component {

    state = {
        collapsed: true,
        loading: false,
        title: '',
        content: '',
        color: 'white'
    };

    constructor(props) {
        super(props);
        this.toggleInput = this.toggleInput.bind(this);
    }

    toggleInput() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    submit = (e) => {
        e.preventDefault();

        this.toggleInput();
        if (!this.state.title && !this.state.content) {
            return false;
        }
        this.setState({ loading: true });
        if (this.props.note && this.props.note.id) {
            console.log(this.state.color, this.state.title, this.state.content);
        } else {
            const { color, title, content } = this.state;
            axios.post(config.baseUrl + 'api/note', {
                color,
                title,
                content,
            }).then(res => {
                if (res.status === 200) {
                    console.log('noteid ', res.data.id)
                    this.setState({ loading: false });
                    this.props.addNote({
                        color,
                        title,
                        content,
                        id: res.data.id,
                        images: [],
                        labels: [],
                        isDeleted: false,
                        isArchived: false,
                        isPinned: false,
                    })
                }
            })
        }
    }

    render() {
        let classes = '';

        // Color
        if (this.state.color) {
            classes += ` ${this.state.color}`;
        }

        const styles = {
            width: 'calc(100% - 64px)',
            maxWidth: 600,
            margin: '40px auto 24px',
            textAlign: 'left',
            // backgroundColor: this.state.color,
        };

        let collapsed = (
            <Card style={styles} onClick={this.toggleInput} containerStyle={{ padding: 0 }}>
                <CardContent>
                    <Typography>
                        Take a note...
                    </Typography>
                </CardContent>
            </Card>
        );

        let expanded = (
            <form
                onSubmit={e => this.submit(e)}>
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
                            multiline
                            rows={1}
                            rowsMax={10}
                            value={this.state.content}
                            onChange={(e) => this.setState({ content: e.target.value })}
                        />
                    </CardContent>
                    <CardActions style={{ textAlign: 'right' }}>
                        <Grid container>
                            <Grid xs={6} item style={{ textAlign: 'left' }}>
                                <Color note={this.state} onChange={color => {
                                    console.log('onchage color', color)
                                    this.setState({ color: color })
                                    // this.setState({color: color.hex})
                                }} />
                            </Grid>
                            <Grid xs={6} item style={{ textAlign: 'right' }}>
                                <Button
                                    onClick={this.submit}
                                    variant="text"
                                    type="submit"
                                    color="inherit"
                                >
                                    Close
                                </Button>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Card>
            </form>
        );

        return (
            this.state.collapsed ? collapsed : expanded
        )
    }
}

export default (Create);