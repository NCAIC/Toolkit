# NCAIC CLI Toolkit

A collection of tools for NCAIC competitors.

## Installation

There are multiple ways to use the toolkit.

### Install globally by using NPM

Requirements: Node.js

This method only install the toolkit, without any language support (but JS support should be already satisfied).

```sh
npm i -g ncaic
```

You can then use `ncaic check` to check the language support on your system.

### Using Docker Image

Requirements: Docker

This methods provides a Docker image including the toolkit and all the language support.

```sh
docker run --rm jacoblincool/ncaic
```

You can run command like this:

```sh
docker run --rm jacoblincool/ncaic check
```

> Note: Images are hosted on Docker Hub: [jacoblincool/ncaic](https://hub.docker.com/r/jacoblincool/ncaic/)

## Commands

### Checkout the help menu

```sh
ncaic --help
```

You can use `ncaic <command> --help` to get the help for a specific command.

### Check the language support on your system

```sh
ncaic check
```

### Verify the `team.json` file

```sh
ncaic verify
```

### Test the agent program

```sh
ncaic test
```

### Create and initialize a config file

```sh
ncaic init
```

### Run the local competition server

```sh
ncaic run
```

### Run a performance test

It is useful to find the performance gap between your computer and the competition server.

```sh
ncaic perf
```
