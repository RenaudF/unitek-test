# Description

Given the dot file (attached), please create visualizations as below:

1. Node gradient coloring based on frequency.
2. Edges in the most frequent path followed must have a different color.
3. Nodes involved in the most frequent path in a different shape.
4. Edge thickness based on frequency of the edge used.

Bonus points for:

1. clickable nodes => For example, (clicking on the node opens a new tab that says, you have just clicked `<nodename>`).
2. Dockerize the application

# How to run

You will need to have [docker](https://www.docker.com/) installed.

The following commands will build the docker image and then run it in a container.

```
docker build -t webserver .
docker run -it --rm -p 8080:80 --name web webserver
```

Once you have it running, to access the application simply browse to [http://localhost:8080](http://localhost:8080)

# Development

You can edit these files directly, rebuild the image and run it manually without any extra dependencies. You can also use the [npm](https://www.npmjs.com/get-npm) scripts provided for convenience (see the `scripts: { ... }` section in `package.json`). It is recommended you setup your text editor to work with `eslint` and `prettier` to make sure you adhere to the standard code styling.

- To avoid manually rebuilding everytime you make a change, simply run:

```
npm run watch
```

- To automatically enforce code styling without extra editor configuration, you can run instead:

```
npm run watch:style
```
