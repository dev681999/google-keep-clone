package main

import (
	"errors"
	"time"

	lib "github.com/dev681999/helperlibs"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"github.com/google/uuid"
	"github.com/patrickmn/go-cache"
)

// user roles
const (
	userAdmin = iota
	userCustomer
)

type user struct {
	ID               string `bson:"_id" json:"id"`
	Password         string `bson:"password" json:"-"`
	Pass             string `bson:"-" json:"password"`
	Email            string `json:"email"`
	Name             string `json:"name"`
	Role             int    `json:"role"`
	IsBlocked        bool   `json:"isBlocked"`
	VerificationCode string `json:"verificationCode"`
}

const (
	usersCollection = "users"
)

type userHandler struct {
	db   *lib.Store
	hash *lib.Hash
	c    *cache.Cache
}

func newUserHandler(db *lib.Store) *userHandler {
	return &userHandler{
		db:   db,
		hash: &lib.Hash{},
		c:    cache.New(5*time.Minute, 10*time.Minute),
	}
}

func (h *userHandler) init() error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	collection := db.DB("").C(usersCollection)

	if err := collection.EnsureIndex(mgo.Index{
		Key:        []string{"email"},
		Unique:     true,
		DropDups:   true,
		Background: false,
	}); err != nil {
		return err
	}

	/* h.add(&user{
		Pass:  "123",
		Email: "admin",
		Role:  userAdmin,
		Name:  "Admin",
	}) */

	return nil
}

func (h *userHandler) add(u *user) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	hash, err := h.hash.Generate(u.Pass)
	if err != nil {
		return err
	}

	token, _ := uuid.NewRandom()

	u.ID = u.Email
	u.IsBlocked = true
	u.Password = hash
	u.VerificationCode = token.String()

	err = db.DB("").C(usersCollection).Insert(u)
	if err != nil {
		return err
	}

	return nil
}

func (h *userHandler) verify(id string, password string) (*user, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return nil, err
	}

	defer db.Close()

	u := &user{}

	err = db.DB("").C(usersCollection).Find(bson.M{"_id": id, "isBlocked": false}).One(u)
	if err != nil {
		return nil, err
	}

	err = h.hash.Compare(u.Password, password)
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (h *userHandler) find(id string) (*user, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return nil, err
	}

	defer db.Close()

	u := &user{}

	err = db.DB("").C(usersCollection).Find(bson.M{"_id": id}).One(u)
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (h *userHandler) activate(id, verificationCode string) error {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()

	err = db.DB("").C(usersCollection).Update(bson.M{
		"_id":              id,
		"verificationCode": verificationCode,
		"isBlocked":        true,
	}, bson.M{
		"$set": bson.M{
			"verificationCode": "",
			"isBlocked":        false,
		},
	})
	if err != nil {
		return err
	}

	return nil
}

func (h *userHandler) generateForgetPassword(id string) (string, string, error) {
	db, err := h.db.GetMongoSession()
	if err != nil {
		return "", "", err
	}

	defer db.Close()

	u := &user{}

	err = db.DB("").C(usersCollection).Find(bson.M{"_id": id, "isBlocked": false}).One(u)
	if err != nil {
		return "", "", err
	}

	token, _ := uuid.NewRandom()

	h.c.Set(id, token.String(), time.Minute*10)

	return token.String(), u.Name, nil
}

func (h *userHandler) changePassword(id, verificationCode, password string) error {
	if requriedCode, found := h.c.Get(id); !found || requriedCode.(string) != verificationCode {
		return errors.New("verification code incorrect")
	}

	db, err := h.db.GetMongoSession()
	if err != nil {
		return err
	}

	defer db.Close()
	hash, err := h.hash.Generate(password)
	if err != nil {
		return err
	}

	err = db.DB("").C(usersCollection).Update(bson.M{
		"_id":       id,
		"isBlocked": false,
	}, bson.M{
		"$set": bson.M{
			"password": hash,
		},
	})
	if err != nil {
		return err
	}

	return nil
}
