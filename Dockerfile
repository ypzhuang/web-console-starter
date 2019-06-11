FROM ypzhuang/nodewithgit as builder

WORKDIR /root
COPY . /root
#RUN npm install --registry=https://registry.npm.taobao.org --verbose
RUN npm install --verbose
RUN npm run build:prod


FROM openresty/openresty:alpine

MAINTAINER John Zhuang <zhuangyinping@gmail.com>

ENV GATEWAY_URL http://15.38.201.205:8080
COPY --from=builder /root/dist /usr/share/nginx/html

COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

EXPOSE 80
