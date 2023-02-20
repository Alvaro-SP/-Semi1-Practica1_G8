FROM golang:1.15-alpine
LABEL developer="Semi1_BackendGolang"
# Seteamos el work directory
WORKDIR /app
COPY . .
# Download the dependencies
RUN go mod download
# Import the gorilla library
RUN go get -u github.com/gorilla/mux
# Import the MySQL driver
RUN go get -u github.com/go-sql-driver/mysql
RUN go build -o main
EXPOSE 8080
CMD ["./main"]
# All is ready :v