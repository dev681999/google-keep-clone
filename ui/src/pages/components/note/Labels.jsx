import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
    fab: {
        margin: theme.spacing(1),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}));

export default function Labels(props) {
    const classes = useStyles();

    const handleDelete = (l) => {
        props.removeLabel(l);
    };

    if (props.note.labels === null || props.note.labels.length < 1) {
        return <></>;
    }

    return (
        <div onClick={(e) => {
            e.stopPropagation();
        }} className={classes.root}>
            {props.note.labels.map((l) => <Chip
                color="inherit"
                label={l}
                onDelete={() => handleDelete(l)}
            />)}

            {/* <Chip
                onClick={(e) => {
                    e.stopPropagation();
                    alert('add')
                }}
                icon={<AddIcon />}
                color="inherit"
            /> */}
        </div>
    );
}
