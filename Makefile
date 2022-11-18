.Phony: install_nvm

local-deploy:
	npx hardhat run scripts/deploy-token.ts --network hardhat

test: hardhat
	npx hardhat test

hardhat:
	npm install --save-dev hardhat
	npx hardhat

install_nvm:
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
	nvm install 18
	nvm use 18
	nvm alias default 18
	npm install npm --global