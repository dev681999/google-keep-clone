package main

import (
	"net/http"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

func (a *app) createNote(c echo.Context) error {
	note := &note{}
	err := c.Bind(note)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	note.User = getUserFromContext(c).ID

	err = a.noteHandler.add(note)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
		"id":  note.ID,
	})
}

func (a *app) getNotes(c echo.Context) error {
	notes := []*note{}
	var err error
	user := getUserFromContext(c).ID

	switch c.QueryParam("query") {
	case "normal":
		notes, err = a.noteHandler.getAllByUserNormal(user)
	case "archived":
		notes, err = a.noteHandler.getAllByUserArchived(user)
	case "deleted":
		notes, err = a.noteHandler.getAllByUserDeleted(user)
	case "label":
		text := c.QueryParam("text")
		notes, err = a.noteHandler.getAllByUserLabel(user, text)
	default:
		notes, err = a.noteHandler.getAllByUser(user)
	}

	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg":   "ok",
		"notes": notes,
	})
}

func (a *app) updateNote(c echo.Context) error {
	// user := getUserFromContext(c).ID
	id := c.Param("id")
	note := &note{}
	err := c.Bind(note)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	switch c.QueryParam("query") {
	case "main":
		err = a.noteHandler.updateMain(id, note.Title, note.Content, note.Color)
	case "color":
		err = a.noteHandler.updateColor(id, note.Color)
	case "isArchived":
		err = a.noteHandler.updateIsArchived(id, note.IsArchived)
	case "isDeleted":
		err = a.noteHandler.updateIsDeleted(id, note.IsDeleted)
	case "isPinned":
		err = a.noteHandler.updateIsPinned(id, note.IsPinned)
	case "addImages":
		err = a.noteHandler.addImages(id, note.Images)
	case "deleteImages":
		err = a.noteHandler.removeImages(id, note.Images)
	case "addLabels":
		err = a.noteHandler.addLabels(id, note.Labels)
	case "deleteLabels":
		err = a.noteHandler.removeLabels(id, note.Labels)
	default:
		err = a.noteHandler.updateMain(id, note.Title, note.Content, note.Color)
	}

	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}

func (a *app) deleteNote(c echo.Context) error {
	id := c.Param("id")
	err := a.noteHandler.delete(id)

	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}
