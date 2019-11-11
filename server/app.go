package main

import (
	"context"
	"errors"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"

	lib "github.com/dev681999/helperlibs"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type appConfig struct {
	Addr      string `json:"addr"`
	DBURL     string `json:"dbUrl"`
	DBUser    string `json:"dbUser"`
	DBPass    string `json:"dbPass"`
	DBName    string `json:"dbName"`
	JwtSecret string `json:"jwt"`
}

type app struct {
	c            *appConfig
	e            *echo.Echo
	db           *lib.Store
	userHandler  *userHandler
	noteHandler  *noteHandler
	labelHandler *labelHandler
	emailHandler *emailHandler
}

func newApp(config *appConfig) *app {
	if config == nil {
		return nil
	}

	s := &lib.Store{
		Address:  config.DBURL,
		Database: config.DBName,
		Password: config.DBPass,
		Username: config.DBUser,
	}

	return &app{
		c:            config,
		e:            echo.New(),
		db:           s,
		userHandler:  newUserHandler(s),
		noteHandler:  newNoteHandler(s),
		labelHandler: newLabelHandler(s),
		emailHandler: newEmailHandler(),
	}
}

func (a *app) checkAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims := getUserFromContext(c)
		if claims.Role != userAdmin {
			log.Println("not admin")
			err := errors.New("only admin authorised")
			return echo.NewHTTPError(http.StatusUnauthorized, echo.Map{
				"msg": err.Error(),
			})
		}
		// log.Println("admin")
		return next(c)
	}
}

func (a *app) checkCustomer(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims := getUserFromContext(c)
		if claims.Role != userCustomer {
			log.Println("not customer")
			err := errors.New("only customer authorised")
			return echo.NewHTTPError(http.StatusUnauthorized, echo.Map{
				"msg": err.Error(),
			})
		}
		// log.Println("admin")
		return next(c)
	}
}

func (a *app) Init() error {
	log.Println("init start")
	log.Println("connecting db")

	err := a.db.Connect()
	if err != nil {
		a.Close()
		return err
	}

	err = a.userHandler.init()
	if err != nil {
		a.Close()
		return err
	}

	log.Println("connecting db success")
	log.Println("starting HTTP server")

	a.e.HideBanner = true

	a.e.Use(middleware.Logger())
	a.e.Use(middleware.Recover())
	a.e.Use(middleware.CORS())

	a.e.POST("/login", a.login)
	a.e.POST("/register", a.register)
	a.e.GET("/activate", a.activateUser)
	a.e.POST("/forgetPassword", a.generateForgetPassword)
	a.e.POST("/changePassword", a.changePassword)

	a.e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "./public",
		Browse: true,
		HTML5:  true,
	}))

	api := a.e.Group("/api")
	api.Use(middleware.JWT([]byte(a.c.JwtSecret)))

	noteAPI := api.Group("/note")
	labelAPI := api.Group("/label")

	noteAPI.POST("", a.createNote)
	noteAPI.POST("/", a.createNote)

	noteAPI.GET("", a.getNotes)
	noteAPI.GET("/", a.getNotes)

	noteAPI.PATCH("/:id", a.updateNote)
	noteAPI.PATCH("/:id/", a.updateNote)

	noteAPI.DELETE("/:id", a.deleteNote)
	noteAPI.DELETE("/:id/", a.deleteNote)

	labelAPI.POST("/:id", a.createLabel)
	labelAPI.POST("/:id/", a.createLabel)

	labelAPI.GET("", a.getLabels)
	labelAPI.GET("/", a.getLabels)

	labelAPI.DELETE("/:id", a.deleteLabel)
	labelAPI.DELETE("/:id/", a.deleteLabel)

	go func() {
		if err := a.e.Start(a.c.Addr); err != nil {
			log.Println("HTTP server shutdown")
		}
	}()

	log.Println("init complete")
	return nil
}

func (a *app) Close() {
	log.Println("closing start")
	log.Println("closing HTTP server")

	if a.e != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := a.e.Shutdown(ctx); err != nil {
			log.Println(err)
		}
		cancel()
	}

	log.Println("closed echo server")
	log.Println("closing db connection")

	if a.db != nil {
		a.db.Close()
	}

	log.Println("closed db connection")
	log.Println("closing storm db connection")

	log.Println("closed storm db connection")
	log.Println("close complete")
}
