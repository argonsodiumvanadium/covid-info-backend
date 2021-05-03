package main

import (
	"log"
	"net/http"
)

func main () {
	fileServer := http.FileServer(http.Dir("./API"))

	http.Handle ("/",fileServer)

	log.Print("\u001B[32mstarting server\u001B[0m")
	if err := http.ListenAndServe("0.0.0.0:4200",nil); err != nil {
		log.Fatal(err)
	}
	
}
