package main

import (
	lib "github.com/dev681999/helperlibs"
	log "github.com/sirupsen/logrus"

	"github.com/google/uuid"
)

func main() {
	log.SetReportCaller(true)
	c := &appConfig{}
	err := lib.ConfigFromFile(c)
	if err != nil {
		panic(err)
	}

	if c.JwtSecret == "" {
		t, _ := uuid.NewRandom()
		jwt := t.String()

		c.JwtSecret = jwt

		err = lib.SaveConfigToFile(c)
		if err != nil {
			panic(err)
		}
	}

	log.Printf("config: %+v", c)

	a := newApp(c)

	err = lib.RunApp(a)
	if err != nil {
		panic(err)
	}
}
