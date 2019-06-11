FROM ypzhuang/nodewithgit as builder

WORKDIR /root
COPY . /root
RUN npm config set proxy http://web-proxy.cn.hpicorp.net:8080
RUN npm config set https-proxy http://web-proxy.cn.hpicorp.net:8080
RUN npm config set strict-ssl false
RUN npm install --verbose
RUN npm run build:prod


FROM openresty/openresty:alpine

MAINTAINER John Zhuang <zhuangyinping@gmail.com>

ENV GATEWAY_URL http://15.38.201.205:8080
COPY --from=builder /root/dist /usr/share/nginx/html

COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

EXPOSE 80
