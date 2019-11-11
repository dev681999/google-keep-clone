package main

import (
	"net/http"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

func (a *app) createLabel(c echo.Context) error {
	label := c.Param("id")
	user := getUserFromContext(c).ID

	err := a.labelHandler.add(user, label)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}

func (a *app) getLabels(c echo.Context) error {
	user := getUserFromContext(c).ID

	labels, err := a.labelHandler.getAll(user)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg":    "ok",
		"labels": labels,
	})
}

func (a *app) deleteLabel(c echo.Context) error {
	user := getUserFromContext(c).ID
	label := c.Param("id")

	err := a.labelHandler.delete(user, label)
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	err = a.noteHandler.removeAllLabels(user, []string{label})
	if err != nil {
		log.Println(err)
		return a.makeError(c, http.StatusInternalServerError, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}
