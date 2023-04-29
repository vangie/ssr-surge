.DEFAULT_GOAL := all

# 定义编译器和编译选项
CC = esbuild
CFLAGS = --bundle

# 定义源文件和目标文件路径
SRC_DIR = src
DIST_DIR = dist
SRC_FILES = $(wildcard $(SRC_DIR)/ssr-surge-*.js)
DIST_FILES = $(patsubst $(SRC_DIR)/%.js,$(DIST_DIR)/%.js,$(SRC_FILES))

# 初始化规则
setup:
	brew bundle

# 构建规则
all: $(DIST_FILES) $(DIST_DIR)/ssr.sgmodule

$(DIST_DIR)/%.js: $(SRC_DIR)/%.js $(SRC_DIR)/lib/*.js
	$(CC) $(CFLAGS) $< --outfile=$@

$(DIST_DIR)/ssr.sgmodule: $(SRC_DIR)/ssr.sgmodule
	cp $< $@

# 清理规则
clean:
	rm -rf $(DIST_DIR)

# 安装规则
install:
	@if [ -z "$(SURGE_PROFILES)" ]; then \
		SURGE_PROFILES="$(HOME)/Library/Application Support/Surge/Profiles"; \
	fi; \
	echo "Installing to $$SURGE_PROFILES:"; \
	find $(DIST_DIR) -type f -exec echo "  {}" \; -exec cp -f {} "$$SURGE_PROFILES" \;


.PHONY: all clean setup install
