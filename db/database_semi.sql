-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP DATABASE IF EXISTS mydb;

CREATE DATABASE mydb;

USE mydb;

-- -----------------------------------------------------
-- Table `mydb`.`usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario
(
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `username`    VARCHAR(45)  NOT NULL UNIQUE,
    `name`        VARCHAR(100) NOT NULL,
    `password`    VARCHAR(50)  NOT NULL,
    `description` TEXT         NOT NULL,
    `photo`       VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `mydb`.`fotos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS fotos;

CREATE TABLE fotos
(
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `name_photo`  VARCHAR(45)  NOT NULL,
    `photo_link`  VARCHAR(150) NOT NULL,
    `description` TEXT         NOT NULL,
    `userid`      INT          NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`userid`) REFERENCES usuario (`id`)
);

-- -----------------------------------------------------
-- Table `mydb`.`album`
-- -----------------------------------------------------
DROP TABLE IF EXISTS album;

CREATE TABLE IF NOT EXISTS album
(
    `id`         INT         NOT NULL AUTO_INCREMENT,
    `name_album` VARCHAR(45) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `mydb`.`album_fotos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS album_fotos;

CREATE TABLE IF NOT EXISTS album_fotos
(
    `id`       INT NOT NULL AUTO_INCREMENT,
    `album_id` INT NOT NULL,
    `fotos_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`album_id`) REFERENCES album (`id`),
    FOREIGN KEY (`fotos_id`) REFERENCES fotos (`id`)
);

DROP PROCEDURE IF EXISTS RegistroAlbumFoto;
DELIMITER $$
CREATE PROCEDURE RegistroAlbumFoto(nameA VARCHAR(45), url VARCHAR(150))
BEGIN
    DECLARE idAlbum INT;
    DECLARE idFoto INT;
    -- verificar si existe album con dicho nombre
    IF NOT EXISTS(SELECT 1 FROM album WHERE name_album = nameA) THEN
        INSERT INTO album (name_album) VALUES (nameA);
    END IF;
    -- obtenemos el id del album
    SELECT id INTO idAlbum FROM album WHERE name_album = nameA;
    -- obtenemos el id de la foto
    SELECT id INTO idFoto FROM fotos WHERE photo_link = url;
    INSERT INTO album_fotos (album_id, fotos_id) VALUES (idAlbum, idFoto);
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS RegistroUsuario;
DELIMITER $$
CREATE PROCEDURE RegistroUsuario(usernamev VARCHAR(45), namev VARCHAR(100), passwordv VARCHAR(50), descriptionv TEXT,
                                 urlv VARCHAR(150))
BEGIN
    DECLARE idUser INT;
    DECLARE idAlbum INT;
    DECLARE idFoto INT;

    -- Ingreso de usuario
    IF NOT EXISTS(SELECT 1 FROM usuario WHERE username = usernamev) THEN
        INSERT INTO usuario (username, name, password, description, photo)
        VALUES (usernamev, namev, passwordv, descriptionv, urlv);
    END IF;
    -- Id usuario
    SELECT id INTO idUser FROM usuario WHERE username = usernamev;

    -- Ingreso de foto
    INSERT INTO fotos (name_photo, photo_link, description, userid) VALUES ('profilepic', urlv, descriptionv, idUser);
    -- Id de la foto
    SELECT id INTO idFoto FROM fotos WHERE photo_link = urlv;


    -- verificar si existe album
    IF NOT EXISTS(SELECT 1 FROM album WHERE name_album = CONCAT('perfil_', usernamev)) THEN
        INSERT INTO album (name_album) VALUES (CONCAT('perfil_', usernamev));
    END IF;
    -- Id del album
    SELECT id INTO idAlbum FROM album WHERE name_album = CONCAT('perfil_', usernamev);

    INSERT INTO album_fotos (album_id, fotos_id) VALUES (idAlbum, idFoto);
END $$
DELIMITER ;