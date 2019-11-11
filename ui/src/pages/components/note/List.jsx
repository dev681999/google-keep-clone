import React, { Component } from 'react';
import * as Masonry from 'masonry-layout';
import Tile from './Tile';

class List extends Component {

    constructor(props) {
        super(props);
        console.log('LIST LABELS', props.labels);
        this.state = {
            masonry: null
        };
    }

    componentDidMount() {
        const elem = document.querySelector('.NotesList' + this.props.id);
        const masonry = new Masonry(elem, {
            itemSelector: '.Note',
            columnWidth: 300,
            gutter: 5,
            isFitWidth: true
        });
        this.setState({
            masonry: masonry
        });
    }

    componentDidUpdate() {
        if (this.state.masonry) {
            this.state.masonry.reloadItems();
            this.state.masonry.layout();
        }
    }

    render() {
        return (
            <div className={"NotesList" + this.props.id} style={{ margin: 'auto' }}>
                {this.props.notes && this.props.notes.map((note) => {
                    if (!note.labels) {
                        note.labels = [];
                    }
                    return <Tile {...this.props} removeLabel={this.props.removeLabel} addLabel={this.props.addLabel} key={note.id} note={note} labels={this.props.labels} />
                }
                )}
            </div>
        )
    }
}

export default List