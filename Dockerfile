FROM nginx:latest
COPY ./app /usr/share/nginx/html
COPY ./test.gv /usr/share/nginx/html
