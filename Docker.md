# Containerization 容器化

```sh
# sample code to build a docker image
docker build -t devserver:5000/comfyui-frontend:1.0.1 .

# sample code to stop and remove a container
docker stop comfyui-frontend
docker rm comfyui-frontend

# sample code to run a container, please replace the version number with the latest version
docker run -d \
--restart unless-stopped \
--name comfyui-frontend -p 9180:9180 \
devserver:5000/comfyui-frontend:1.0.1

```