package main

import (
	"time"

	lib "github.com/dev681999/helperlibs"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type note struct {
	ID         string    `bson:"_id" json:"id"`
	User       string    `json:"user"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	IsPinned   bool      `json:"isPinned"`
	IsArchived bool      `json:"isArchived"`
	IsDeleted  bool      `json:"isDeleted"`
	Labels     []string  `json:"labels"`
	Images     []string  `json:"images"`
	Color      string    `json:"color"`
	CreatedAt  time.Time `json:"createAt"`
	ModifiedAt time.Time `json:"modifiedAt"`
}

const (
	notesCollection = "notes"
)

type noteHandler struct {
	db *lib.Store
}

func newNoteHandler(db *lib.Store) *noteHandler {
	return &noteHandler{
		db: db,
	}
}

func (h *noteHandler) add(n *note) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	n.ID = bson.NewObjectId().Hex()
	n.CreatedAt = time.Now()
	n.ModifiedAt = time.Now()

	err = db.DB("").C(notesCollection).Insert(n)
	if err != nil {
		return err
	}

	return nil
}

func (h *noteHandler) find(id string) (*note, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return nil, err
	}

	defer db.Close()

	n := &note{}

	err = db.DB("").C(notesCollection).Find(bson.M{"_id": id}).One(n)
	if err != nil {
		return nil, err
	}

	return n, nil
}

func (h *noteHandler) _getAll(query bson.M) ([]*note, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return nil, err
	}

	defer db.Close()

	n := []*note{}

	err = db.DB("").C(notesCollection).Find(query).Sort("-modifiedAt").All(&n)
	if err != nil {
		if err == mgo.ErrNotFound {
			return n, nil
		}
		return nil, err
	}

	return n, nil
}

func (h *noteHandler) getAllByUser(user string) ([]*note, error) {
	return h._getAll(bson.M{
		"user": user,
	})
}

func (h *noteHandler) getAllByUserNormal(user string) ([]*note, error) {
	return h._getAll(bson.M{
		"user":       user,
		"isArchived": false,
		"isDeleted":  false,
	})
}

func (h *noteHandler) getAllByUserArchived(user string) ([]*note, error) {
	return h._getAll(bson.M{
		"user":       user,
		"isArchived": true,
		"isDeleted":  false,
	})
}

func (h *noteHandler) getAllByUserDeleted(user string) ([]*note, error) {
	return h._getAll(bson.M{
		"user":      user,
		"isDeleted": true,
	})
}

func (h *noteHandler) getAllByUserLabel(user, label string) ([]*note, error) {
	return h._getAll(bson.M{
		"user":       user,
		"isArchived": false,
		"isDeleted":  false,
		"labels":     label,
	})
}

func getUpdateBlock(block bson.M) bson.M {
	block["modifiedAt"] = time.Now()
	return block
}

func getSetBlock(block bson.M) bson.M {
	return bson.M{
		"$set": block,
	}
}

func (h *noteHandler) _update(id string, update bson.M) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	err = db.DB("").C(notesCollection).Update(bson.M{
		"_id": id,
	}, update)
	if err != nil {
		return err
	}

	return nil
}

// Main means title, content & color
func (h *noteHandler) updateMain(id, title, content, color string) error {
	return h._update(id, getSetBlock(getUpdateBlock(bson.M{
		"title":   title,
		"content": content,
		"color":   color,
	})))
}

func (h *noteHandler) updateColor(id, color string) error {
	return h._update(id, getSetBlock(getUpdateBlock(bson.M{
		"color": color,
	})))
}

func (h *noteHandler) updateIsArchived(id string, isArchived bool) error {
	return h._update(id, getSetBlock(getUpdateBlock(bson.M{
		"isArchived": isArchived,
	})))
}

func (h *noteHandler) updateIsPinned(id string, isPinned bool) error {
	return h._update(id, getSetBlock((getUpdateBlock(bson.M{
		"isPinned": isPinned,
	}))))
}

func (h *noteHandler) updateIsDeleted(id string, isDeleted bool) error {
	update := bson.M{
		"isDeleted": isDeleted,
	}

	/* if isDeleted {
		update["isArchived"]
	} */

	return h._update(id, getSetBlock(getUpdateBlock(update)))
}

func (h *noteHandler) addImages(id string, images []string) error {
	return h._update(id, bson.M{
		"$addToSet": bson.M{
			"images": bson.M{
				"$each": images,
			},
		},
		"$set": getUpdateBlock(bson.M{}),
	})
}

func (h *noteHandler) removeImages(id string, images []string) error {
	return h._update(id, bson.M{
		"$pull": bson.M{
			"images": bson.M{
				"$in": images,
			},
		},
		"$set": getUpdateBlock(bson.M{}),
	})
}

func (h *noteHandler) addLabels(id string, labels []string) error {
	return h._update(id, bson.M{
		"$addToSet": bson.M{
			"labels": bson.M{
				"$each": labels,
			},
		},
		"$set": getUpdateBlock(bson.M{}),
	})
}

func (h *noteHandler) removeLabels(id string, labels []string) error {
	return h._update(id, bson.M{
		"$pull": bson.M{
			"labels": bson.M{
				"$in": labels,
			},
		},
		"$set": getUpdateBlock(bson.M{}),
	})
}

func (h *noteHandler) removeAllLabels(user string, labels []string) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	err = db.DB("").C(notesCollection).Update(bson.M{
		"user": user,
		"labels": bson.M{
			"$in": labels,
		},
	}, bson.M{
		"$pull": bson.M{
			"labels": bson.M{
				"$in": labels,
			},
		},
		"$set": getUpdateBlock(bson.M{}),
	})
	if err != nil {
		return err
	}

	return nil
}

func (h *noteHandler) delete(id string) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	err = db.DB("").C(notesCollection).Remove(bson.M{"_id": id})
	if err != nil {
		return err
	}

	return nil
}
