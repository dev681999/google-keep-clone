package main

import (
	"fmt"

	lib "github.com/dev681999/helperlibs"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type label struct {
	ID   string `bson:"_id"`
	User string `bson:"user"`
	Text string `bson:"text"`
}

const (
	labelsCollection = "labels"
)

type labelHandler struct {
	db *lib.Store
}

func newLabelHandler(db *lib.Store) *labelHandler {
	return &labelHandler{
		db: db,
	}
}

func (h *labelHandler) add(user, text string) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	label := &label{
		ID:   fmt.Sprintf("%v-%v", user, text),
		User: user,
		Text: text,
	}

	err = db.DB("").C(labelsCollection).Insert(label)
	if err != nil {
		return err
	}

	return nil
}

func (h *labelHandler) getAll(user string) ([]string, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return nil, err
	}

	defer db.Close()

	labels := []*label{}

	err = db.DB("").C(labelsCollection).Find(bson.M{"user": user}).All(&labels)
	if err != nil {
		if err == mgo.ErrNotFound {
			return []string{}, err
		}
		return nil, err
	}

	labelNames := []string{}

	for _, label := range labels {
		labelNames = append(labelNames, label.Text)
	}

	return labelNames, nil
}

func (h *labelHandler) delete(user, text string) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	err = db.DB("").C(labelsCollection).Remove(bson.M{"_id": fmt.Sprintf("%v-%v", user, text)})
	if err != nil {
		return err
	}

	return nil
}
