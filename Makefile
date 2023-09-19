default: docker

css:
	npx tailwindcss -i ./tailwind.input.css -o ./web/tailwind.output.css

docker:
	docker build -t awakari/webapp .

staging: docker
	./scripts/staging.sh

release: docker
	./scripts/release.sh
