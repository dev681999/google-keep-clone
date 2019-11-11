package main

import (
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
)

type emailRequest struct {
	email   string
	name    string
	msg     string
	subject string
}

type emailHandler struct{}

func newEmailHandler() *emailHandler {
	return &emailHandler{}
}

func (h *emailHandler) sendMails(mails []emailRequest) {
	m := mail.NewV3Mail()

	from := mail.NewEmail("admin", "admin@bibliotek.com")
	content := mail.NewContent("text/html", "%msg")

	m.SetFrom(from)
	m.AddContent(content)

	for _, mailReq := range mails {
		personalization := mail.NewPersonalization()
		to := mail.NewEmail(mailReq.name, mailReq.email)

		log.Println(mailReq.msg)

		personalization.AddTos(to)
		personalization.SetSubstitution("%msg", mailReq.msg)
		personalization.Subject = mailReq.subject
		m.AddPersonalizations(personalization)
	}

	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	response, err := sendgrid.API(request)
	if err != nil {
		log.Println(err)
	} else {
		log.Println(response.StatusCode)
		log.Println(response.Body)
		log.Println(response.Headers)
	}
}
