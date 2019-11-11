import React, { Component } from 'react';
import { Card, CardHeader, CardContent, CardActions, Dialog, CardMedia, IconButton, Icon, Tooltip, Paper, Typography } from '@material-ui/core';
import Color from './Color';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddImageIcon from '@material-ui/icons/Image';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import RestoreIcon from '@material-ui/icons/RestoreFromTrash';
import Editor from './Editor';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Labels from './Labels';

// import NoteMenu from "../NoteMenu/NoteMenu";
// import NoteEditor from "../NoteEditor/NoteEditor";
// import NoteColor from "../NoteColor/NoteColor";

class Tile extends Component {

    constructor(props) {
        super(props);
        let images = props.note.images.map(i => ({
            src: i,
            onHove: false,
        }))

        console.log('labels', props.labels);
        console.log('labels2', props.note.labels);

        this.state = {
            open: false,
            hover: false,
            images,
            anchorEl: null,
            anchorEl2: null,
        }
    }

    handleMenuClick = (e) => {
        e.stopPropagation();
        this.setState({
            anchorEl: e.currentTarget,
        })
    }

    handleMenuClose = (e) => {
        e.stopPropagation();
        this.setState({
            anchorEl: null,
        })
    }

    handleLabelMenuClick = (e) => {
        e.stopPropagation();
        this.setState({
            anchorEl2: e.currentTarget,
        })
    }

    handleLabelMenuClose = (e) => {
        e.stopPropagation();
        this.setState({
            anchorEl2: null,
        })
    }
    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    onMouseEnter = () => {
        this.setState({ hover: true });
    };

    onMouseLeave = () => {
        this.setState({ hover: false });
    };

    render() {

        let classes = '';

        // Color
        if (this.props.note.color) {
            classes += ` ${this.props.note.color}`;
        }

        // Hover
        if (this.state.hover) {
            classes += 'hover';
        }

        // Color
        if (this.props.note.color) {
            classes += ` ${this.props.note.color}`;
        }

        // Font Size
        let fontSize = 14;
        const words = this.props.note.content ? this.props.note.content.split(' ').length : 0;
        if ((words >= 1) && (words < 10)) {
            fontSize = 36;
        } else if ((words >= 10) && (words < 20)) {
            fontSize = 28;
        } else if ((words >= 20) && (words < 30)) {
            fontSize = 24;
        } else if ((words >= 30) && (words < 40)) {
            fontSize = 18;
        }

        const images = [];
        this.state.images.forEach((i) => {
            images.push(<div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                // display: 'block',
            }}>
                <CardMedia
                    component="img"
                    alt=""
                    style={{
                        maxHeight: 100,
                        width: '100%',
                        objectFit: 'scale-down',
                        padding: 4
                    }}
                    // height={0}
                    // paddingTop='56.25%'
                    // height={220}
                    // width={240}
                    // image="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                    image="logo512.png"
                    // image="https://i.stack.imgur.com/yQaqh.png"
                    title=""
                    onMouseEnter={(e) => { }}
                />
                <IconButton size="small" style={{
                    top: 0,
                    left: 0,
                    position: 'absolute',
                    fontSize: 8
                }}>
                    <DeleteIcon />
                </IconButton>
            </div>
            );
        });

        let open = this.state.anchorEl ? true : false;
        let open2 = this.state.anchorEl2 ? true : false;

        console.log('delete', this.props.note)

        return (
            <div className='Note' style={{ width: 300, padding: 8 }}>
                <Card className={classes}
                    onClick={this.handleOpen}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}>
                    {images}
                    <CardHeader onClick={this.handleOpen}
                        style={{ fontWeight: 'bolder' }}
                        title={this.props.note.title}
                        action={
                            this.props.isTrash !== true ? <Tooltip title={this.props.note.isPinned ? "Unpin Note" : "Pin Note"}>
                                <IconButton onClick={e => {
                                    e.stopPropagation();
                                    this.props.setPinned(this.props.note.id, !this.props.note.isPinned)
                                }}>
                                    <Icon color="" style={{
                                        fontSize: 18
                                    }} className="fas fa-thumbtack" />
                                </IconButton>
                            </Tooltip> : null
                        }
                    />
                    {/* <img width='100%' alt='' src="logo512.png"/> */}
                    <CardContent style={{ fontSize: fontSize, wordWrap: 'break-word' }}>
                        {`${this.props.note.content}\n`.split("\n").map(content => <Typography>{content}</Typography>)}
                    </CardContent>
                    <Labels note={this.props.note} removeLabel={(l) => this.props.removeLabel(this.props.note.id, l)} />
                    {this.props.isTrash !== true && <CardActions >
                        <Color changeColor={this.props.changeColor} note={this.props.note} />
                        <IconButton><EditIcon /></IconButton>
                        <IconButton><AddImageIcon /></IconButton>
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            this.props.setArchive(this.props.note.id, !this.props.note.isArchived);
                        }}><ArchiveIcon /></IconButton>
                        <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={this.handleMenuClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={this.state.anchorEl}
                            keepMounted
                            open={open}
                            onClose={this.handleMenuClose}
                            PaperProps={{
                                style: {
                                    maxHeight: 48 * 4.5,
                                    width: 200,
                                },
                            }}
                        >
                            <MenuItem key={"Delete Note"} onClick={(e) => {
                                this.handleMenuClose(e);
                                this.props.setDeleted(this.props.note.id, true);
                            }
                            }>
                                Delete Note
                            </MenuItem>
                            <MenuItem key={"Change Labels"} onClick={(e) => {
                                this.handleMenuClose(e);
                                this.handleLabelMenuClick(e);
                            }
                            }>
                                Change Labels
                            </MenuItem>

                        </Menu>

                        <Paper onClick={(e) => {
                            e.stopPropagation();
                        }} style={{ width: 230, }}>
                            <Menu
                                id="long-menu"
                                anchorEl={this.state.anchorEl2}
                                keepMounted
                                open={open2}
                                onClose={this.handleLabelMenuClose}
                                PaperProps={{
                                    style: {
                                        maxHeight: 48 * 4.5,
                                        width: 200,
                                    },
                                }}
                            >
                                <MenuItem disabled>
                                    Click To Add
                                </MenuItem>
                                {this.props.labels.filter(l => !this.props.note.labels.includes(l)).map(l => {

                                    var val = this.props.note.labels.includes(l);
                                    console.log('map', l, val, this.props.note.labels);
                                    return (< MenuItem onClick={() => { this.props.addLabel(this.props.note.id, l) }} >
                                        {l}
                                    </MenuItem>);
                                })}
                            </Menu>
                        </Paper>

                        {/* <IconButton><DeleteIcon /></IconButton> */}
                        {/* <NoteMenu note={this.props.note} /> */}
                    </CardActions>}
                    {this.props.isTrash === true && <CardActions >
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            this.props.deleteNoteForever(this.props.note.id);
                        }}><DeleteForeverIcon /></IconButton>
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            this.props.restoreNote(this.props.note.id);
                        }}><RestoreIcon /></IconButton>
                    </CardActions>}
                </Card>
                <Dialog
                    modal={false}
                    open={this.state.open}
                    contentStyle={{ width: 600 }}
                    bodyClassName={classes}
                    onClose={this.handleClose}>
                    <Editor changeMain={this.props.changeMain} note={this.props.note} handleClose={this.handleClose} />
                </Dialog>
            </div >
        )
    }
}

export default Tile