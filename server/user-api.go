package main

import (
	"fmt"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
)

type jwtClaims struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role int    `json:"role"`
	jwt.StandardClaims
}

func getUserFromContext(c echo.Context) *jwtClaims {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	log.Println("claims", claims)
	if claims["id"] == nil {
		claims["id"] = ""
	}
	if claims["id"] == nil {
		claims["id"] = "name"
	}
	if claims["role"] == nil {
		claims["role"] = float64(0)
	}

	return &jwtClaims{
		ID:   claims["id"].(string),
		Name: claims["name"].(string),
		Role: int(claims["role"].(float64)),
	}
}

type login struct {
	ID               string `json:"email"`
	Password         string `json:"password"`
	VerificationCode string `json:"VerificationCode"`
}

func (a *app) login(c echo.Context) error {
	l := &login{}
	err := c.Bind(l)
	if err != nil {
		log.Println("bind error")
		return a.makeError(c, http.StatusBadRequest, err)
	}

	u, err := a.userHandler.verify(l.ID, l.Password)
	if err != nil {
		return a.makeError(c, http.StatusUnauthorized, err)
	}

	exp := time.Hour * 24 * 365 * 5 // 5 Years approx

	claims := &jwtClaims{
		u.ID,
		u.Name,
		u.Role,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(exp).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString([]byte(a.c.JwtSecret))
	if err != nil {
		return err
	}

	return a.sendSucess(c, echo.Map{
		"token": t,
		"name":  u.Name,
		"role":  u.Role,
	})
}

func (a *app) register(c echo.Context) error {
	u := &user{}
	err := c.Bind(u)
	if err != nil {
		log.Println("bind error")
		return a.makeError(c, http.StatusBadRequest, err)
	}

	u.Role = userCustomer

	err = a.userHandler.add(u)
	if err != nil {
		log.Printf("error: %+v", err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	go func(a *app, newUser *user) {
		a.emailHandler.sendMails([]emailRequest{{
			email:   u.Email,
			name:    u.Name,
			subject: "Activation Email",
			msg:     fmt.Sprintf(`<a href="http://ec2-54-191-142-124.us-west-2.compute.amazonaws.com:8070/activate?email=%v&verificationCode=%v">Click Here</a>`, u.Email, u.VerificationCode),
		}})
	}(a, u)

	return a.sendSucess(c, map[string]string{
		"msg": "ok",
	})
}

func (a *app) activateUser(c echo.Context) error {
	email := c.QueryParam("email")
	verificationCode := c.QueryParam("verificationCode")

	log.Println("activateUser", email, verificationCode)

	err := a.userHandler.activate(email, verificationCode)
	if err != nil {
		log.Printf("error: %+v", err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	return a.sendSucess(c, "Thankyou for verifying your account")
}

func (a *app) generateForgetPassword(c echo.Context) error {
	l := &login{}
	err := c.Bind(l)
	if err != nil {
		log.Println("bind error")
		return a.makeError(c, http.StatusBadRequest, err)
	}

	code, name, err := a.userHandler.generateForgetPassword(l.ID)
	if err != nil {
		log.Printf("error: %+v", err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	log.Println("verification code for %v is %v", l.ID, name, code)

	go func(a *app, email, name, code string) {
		a.emailHandler.sendMails([]emailRequest{{
			email:   email,
			name:    name,
			subject: "Forget Password Code",
			msg:     fmt.Sprintf(`Your verification code is %v`, code),
		}})
	}(a, l.ID, name, code)

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}

func (a *app) changePassword(c echo.Context) error {
	l := &login{}
	err := c.Bind(l)
	if err != nil {
		log.Println("bind error")
		return a.makeError(c, http.StatusBadRequest, err)
	}

	err = a.userHandler.changePassword(l.ID, l.VerificationCode, l.Password)
	if err != nil {
		log.Printf("error: %+v", err)
		return a.makeError(c, http.StatusBadRequest, err)
	}

	return a.sendSucess(c, echo.Map{
		"msg": "ok",
	})
}
