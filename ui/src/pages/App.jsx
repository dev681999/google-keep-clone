import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Button, Icon, DialogActions, TextField, DialogContent, DialogTitle, Dialog } from '@material-ui/core';
import ArchiveIcon from '@material-ui/icons/Archive';
import BinIcon from '@material-ui/icons/Delete';

import { Route, Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router';
// import FlipMove from 'react-flip-move';
// import { CSSGrid, layout, makeResponsive, measureItems } from 'react-stonecutter';
import Create from './components/note/Create';
import NoteList from './components/note/List';
import { loadCSS } from 'fg-loadcss';
import axios from "axios";

import './App.css';
import AuthService from './Auth';
import config from './config';
// import Tile from './components/note/Tile';

/* const aGrid = makeResponsive(measureItems(CSSGrid), {
	maxWidth: 1920,
	minPadding: 100
}); */
const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
	},
	drawer: {
		[theme.breakpoints.up('sm')]: {
			width: drawerWidth,
			flexShrink: 0,
		},
	},
	appBar: {
		[theme.breakpoints.up('sm')]: {
			width: `calc(100% - ${drawerWidth}px)`,
			marginLeft: drawerWidth,
		},
	},
	menuButton: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	toolbar: theme.mixins.toolbar,
	drawerPaper: {
		width: drawerWidth,
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
	title: {
		flexGrow: 1,
	},
}));

function ListItemLink(props) {
	const { icon, primary, to } = props;

	let location = useLocation();
	var path = location.pathname === to ? true : false;

	console.log(path);

	const renderLink = React.useMemo(
		() =>
			React.forwardRef((itemProps, ref) => (
				// With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
				// See https://github.com/ReactTraining/react-router/issues/6056
				<RouterLink to={to} {...itemProps} innerRef={ref} />
			)),
		[to],
	);

	return (
		<div>
			<ListItem selected={path} button to={to} component={renderLink}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
				{/* {edit && <IconButton onClick={e => {
					e.stopPropagation();
				}}><DeleteIcon /></IconButton>} */}
			</ListItem>
		</div>
	);
}

ListItemLink.propTypes = {
	icon: PropTypes.element,
	primary: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired,
};

function ResponsiveDrawer(props) {
	const { container } = props;
	const classes = useStyles();
	const theme = useTheme();
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	let location = useLocation();

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	let typeOfNote = 0;
	let query = "normal";
	let text = "";

	const splits = location.pathname.split('/');

	switch (splits[1]) {
		case "label":
			typeOfNote = 1;
			query = "label";
			text = splits[2];
			break;
		case "archived":
			typeOfNote = 2;
			query = "archived";
			break;
		case "trash":
			query = "deleted";
			typeOfNote = 3;
			break;
		default:
			break;
	}

	const [notes, changeNotes] = React.useState([/* {
		id: '1',
		color: 'red',
		content: 'HELLO',
		title: 'Title',
		images: ['logo512.png']
	}, {
		id: '2',
		color: 'blue',
		content: 'HELLO',
		title: 'Title',
		images: ['logo512.png']
	}, {
		id: '3',
		color: 'green',
		content: 'HELLO',
		title: 'Title',
		images: ['logo512.png', 'logo192.png']
	}, {
		id: '4',
		color: 'pink',
		content: 'HELLO',
		title: 'Title',
		images: ['logo512.png', 'logo192.png']
	}, */]);

	const [labels, setLabels] = React.useState([]);

	React.useEffect(() => {
		loadCSS(
			'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
			document.querySelector('#font-awesome-css'),
		);


	}, []);

	React.useEffect(() => {
		axios.get(config.baseUrl + 'api/note?query=' + query + '&text=' + text).then(res => {
			if (res.status === 200) {
				const newNotes = res.data.notes;
				axios.get(config.baseUrl + 'api/label').then(res => {
					if (res.status === 200) {
						setLoading(false);
						changeNotes(newNotes);
						setLabels(res.data.labels);
					}
				})
			}
		}).catch(e => {
			console.log(e)
		});
	}, [location]);

	function addNote(note) {
		notes.unshift(note);
		changeNotes([...notes]);
	}

	const [open, setOpen] = React.useState(false);
	const [label, setLabel] = React.useState('');

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		axios.post(config.baseUrl + 'api/label/' + label).then(res => {
			if (res.status === 200) {
				labels.push(label);
				setLabels([...labels]);
				setLabel('');
			}
		})
	};

	const drawer = (
		<div>
			<div className={classes.toolbar} />
			<Divider />
			<List aria-label="main mailbox folders">
				<ListItemLink to="/" primary="Notes" icon={<Icon className="far fa-lightbulb" />} />
			</List>
			<Divider />
			<List>
				{labels.map(l => <ListItemLink to={"/label/" + l} edit={l} primary={l} icon={<Icon className="fas fa-tag" />} />)}
				<ListItem button onClick={handleClickOpen}>
					<ListItemIcon><EditIcon /></ListItemIcon>
					<ListItemText primary="Edit Label" />
				</ListItem>
			</List>
			<Divider />
			<ListItemLink to="/archived" primary="Archived" icon={<ArchiveIcon />} />
			<ListItemLink to="/trash" primary="Trash" icon={<BinIcon />} />
			<Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Manage Label</DialogTitle>
				<DialogContent>
					<List>
						<ListItem onClick={() => { }}>
							<TextField
								placeholder="Label"
								hintStyle={{ fontSize: 16, fontWeight: 800 }}
								inputStyle={{ fontSize: 16, fontWeight: 800 }}
								fullWidth={true}
								underlineShow={false}
								autoFocus
								// value={this.state.label}
								onChange={(e) => setLabel(e.target.value)}
							/>
						</ListItem>
						{labels.map(l => (
							<ListItem onClick={() => {
								axios.delete(config.baseUrl + 'api/label/' + l).then(res => {
									if (res.status === 200) {
										var newNotes = notes.map(n => {
											n.labels = n.labels.filter(label => label !== l);
											return n;
										})
										let newLabels = labels.filter(label => label !== l);
										setLabels([...newLabels]);
										changeNotes([...newNotes]);
									}
								})
							}} key={l}>
								<ListItemText primary={l} />
								<IconButton><DeleteIcon /></IconButton>
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancel
          </Button>
					<Button onClick={handleClose} color="primary">
						Add
          </Button>
				</DialogActions>
			</Dialog>
		</div>
	);

	if (loading) {
		return <h1>Loading...</h1>
	}

	const pinnedNotes = typeOfNote !== 0 && typeOfNote !== 1 ? [] : notes.filter((n) => n.isPinned).sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
	const unPinnedNotes = typeOfNote !== 0 && typeOfNote !== 1 ? [] : notes.filter((n) => !n.isPinned).sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

	function addLabel(id, l) {
		notes.forEach(n => {
			if (n.id === id) {
				n.labels.push(l);
				changeNotes([...notes]);
				axios.patch(config.baseUrl + 'api/note/' + id + '?query=addLabels', {
					labels: [l],
				}).then(res => {
					if (res.status === 200) {
					}
				})
			}
		})
	}

	function removeLabel(id, l) {
		for (let index = 0; index < notes.length; index++) {
			const n = notes[index];

			if (n.id === id) {
				var idx = n.labels.indexOf(l);
				if (idx !== -1) {
					if (typeOfNote === 1) {
						if (notes.length === 1) {
							changeNotes([]);
						} else {
							var newNotes = notes.splice(index - 1, 1);
							changeNotes([...newNotes]);
						}
					} else {
						if (n.labels.length === 1) {
							n.labels = [];
						} else {
							n.labels = n.labels.splice(idx - 1, 1);
						}
						changeNotes([...notes]);
					}
					axios.patch(config.baseUrl + 'api/note/' + id + '?query=deleteLabels', {
						labels: [l],
					}).then(res => {
						if (res.status === 200) {
						}
					})
				}
				break;
			}
		}
	}

	function setPinned(id, status) {
		notes.forEach(n => {
			if (n.id === id) {
				n.isPinned = status;
				n.modifiedAt = (new Date()).toISOString()
				changeNotes([...notes]);
				axios.patch(config.baseUrl + 'api/note/' + id + '?query=isPinned', {
					isPinned: status,
				}).then(res => {
					if (res.status === 200) {
					}
				})
			}
		})
	}

	function setArchive(id, status) {
		var newnotes = notes.filter(n => n.id !== id);
		changeNotes([...newnotes]);
		axios.patch(config.baseUrl + 'api/note/' + id + '?query=isArchived', {
			isArchived: status,
		}).then(res => {
			if (res.status === 200) {
			}
		})
	}

	function setDeleted(id, status) {
		var newnotes = notes.filter(n => n.id !== id);
		changeNotes([...newnotes]);
		axios.patch(config.baseUrl + 'api/note/' + id + '?query=isDeleted', {
			isDeleted: status,
		}).then(res => {
			if (res.status === 200) {
			}
		})
	}

	function changeColor(id, color) {
		notes.forEach(n => {
			if (n.id === id) {
				n.color = color;
			}
		});
		changeNotes([...notes]);
		axios.patch(config.baseUrl + 'api/note/' + id + '?query=color', {
			color: color,
		}).then(res => {
			if (res.status === 200) {
			}
		})
	}

	function deleteNoteForever(id) {
		for (let index = 0; index < notes.length; index++) {
			if (notes.length === 1) {
				changeNotes([]);

			} else {
				var newNotes = notes.splice(index - 1, 1);
				changeNotes([...newNotes]);
			}
			axios.delete(config.baseUrl + 'api/note/' + id).then(res => {
				if (res.status === 200) {
				}
			})
		}
	}

	function restoreNote(id) {
		for (let index = 0; index < notes.length; index++) {
			if (notes.length === 1) {
				changeNotes([]);

			} else {
				var newNotes = notes.splice(index - 1, 1);
				changeNotes([...newNotes]);
			}
			axios.patch(config.baseUrl + 'api/note/' + id + '?query=isDeleted', {
				isDeleted: false,
			}).then(res => {
				if (res.status === 200) {
				}
			})
		}
	}

	function changeMain(id, title, content, color) {
		notes.forEach(n => {
			if (n.id === id) {
				n.color = color;
				n.title = title;
				n.content = content;
			}
		});
		changeNotes([...notes]);
		axios.patch(config.baseUrl + 'api/note/' + id + '?query=main', {
			color,
			content,
			title,
		}).then(res => {
			if (res.status === 200) {
			}
		})
	}

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar position="fixed" className={classes.appBar}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						className={classes.menuButton}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" className={classes.title}>
						Keep
					</Typography>
					<Button onClick={() => {
						new AuthService().logout();
						window.location.replace('');
					}} color="inherit">Logout</Button>
				</Toolbar>
			</AppBar>
			<nav className={classes.drawer} aria-label="mailbox folders">
				{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
				<Hidden smUp implementation="css">
					<Drawer
						container={container}
						variant="temporary"
						anchor={theme.direction === 'rtl' ? 'right' : 'left'}
						open={mobileOpen}
						onClose={handleDrawerToggle}
						classes={{
							paper: classes.drawerPaper,
						}}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
					>
						{drawer}
					</Drawer>
				</Hidden>
				<Hidden xsDown implementation="css">
					<Drawer
						classes={{
							paper: classes.drawerPaper,
						}}
						variant="permanent"
						open
					>
						{drawer}
					</Drawer>
				</Hidden>
			</nav>
			<main className={classes.content}>
				<div className={classes.toolbar} />
				<Route path="/" exact>
					<Create addNote={addNote} />
					<div>
						{pinnedNotes.length > 0 && <h3>Pinned Notes</h3>}
						<NoteList changeMain={changeMain} changeColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="pinned" notes={pinnedNotes} />
					</div>
					<div>
						{pinnedNotes.length > 0 && unPinnedNotes.length > 0 && <h3>Other Notes</h3>}
						<NoteList changeMain={changeMain} changeColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="unpinned" notes={unPinnedNotes} />
					</div>
				</Route>
				<Route path="/label">
					<div>
						{pinnedNotes.length > 0 && <h3>Pinned Notes</h3>}
						<NoteList changeMain={changeMain} changeColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="pinned" notes={pinnedNotes} />
					</div>
					<div>
						{pinnedNotes.length > 0 && unPinnedNotes.length > 0 && <h3>Other Notes</h3>}
						<NoteList changeMain={changeMain} changeColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="unpinned" notes={unPinnedNotes} />
					</div>
				</Route>
				<Route path="/archived">
					<NoteList changeMain={changeMain} changeColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="unpinned" notes={notes} />
				</Route>
				<Route path="/trash">
					<NoteList changeMain={changeMain} deleteNoteForever={deleteNoteForever} restoreNote={restoreNote} isTrash={true} setColor={changeColor} setArchive={setArchive} setDeleted={setDeleted} setPinned={setPinned} removeLabel={removeLabel} addLabel={addLabel} labels={labels} id="unpinned" notes={notes} />
				</Route>
			</main>
		</div>
	);

}

ResponsiveDrawer.propTypes = {
	/**
	 * Injected by the documentation to work in an iframe.
	 * You won't need it on your project.
	 */
	container: PropTypes.instanceOf(typeof Element === 'undefined' ? Object : Element),
};

export default ResponsiveDrawer;
