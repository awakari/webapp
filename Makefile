default: docker

docker:
	docker build -t awakari/webapp .

staging: docker
	./scripts/staging.sh

release: docker
	./scripts/release.sh
