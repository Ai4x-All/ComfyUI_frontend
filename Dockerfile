# 使用官方nginx最新版作为基础镜像
FROM nginx:latest

# 移除默认的nginx配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 将自定义的nginx配置文件复制到容器中
# COPY nginx.conf /etc/nginx/conf.d/

# 将已经build好的前端项目复制到nginx的html目录下
COPY ./dist /usr/share/nginx/html

# 暴露9180端口
EXPOSE 9180

# 容器启动时运行nginx，除非手动停止，否则一直运行
CMD ["nginx", "-g", "daemon off;"]