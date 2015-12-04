SHELL=bash
# set REAL_BUILD in the env to actually do the build; otherwise,
# presumes existence of BUILD_PRODUCT_TGZ and merely packages

SRC := $(shell pwd)

# set these only if not set with ?=
VERSION=1.0
REVISION=0
BUILD_PRODUCT_TGZ=$(SRC)/kitoon-build-output.tar.gz

RPM_REVISION=0
RPMBUILD=$(SRC)/../rpmbuild

DISTNAMEVER=kitoon_$(VERSION)
PKGDIR=kitoon-$(VERSION)
TARDIR=usr/share/skyring/webapp
TARNAME = ../$(DISTNAMEVER).tar.gz

FINDCMD =find . \
        -name .git -prune \
        -o -name node_modules -prune \
        -o -name .tmp -prune \
        -o -name .sass-cache -prune \
        -o -name debian -prune \
        -o -print0

build-all: build-setup build

build-setup:
	sudo npm install -g gulp
	sudo npm install -g bower
	sudo npm install -g tsd
	npm install
	bower install --allow-root
	tsd install

build:
	gulp compile

rpm:    dist-gen
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,BUILDROOT}
	cp kitoon.spec $(RPMBUILD)/SPECS
	( \
	cd $(RPMBUILD); \
	rpmbuild -bb --define "_topdir $(RPMBUILD)" --define "version $(VERSION)" --define "revision $(RPM_REVISION)" --define "tarname $(BUILD_PRODUCT_TGZ)" SPECS/kitoon.spec; \
	)


dist-gen:
	@echo "making dist tarball in $(TARNAME)"
	npm install --silent
	@rm -rf $(PKGDIR)
	@$(FINDCMD) | cpio --null -p -d $(PKGDIR)
	@echo "TAR FILE NAME:", tar -zcf $(TARNAME) $(PKGDIR)
	@rm -fr $(TARDIR) $(BUILD_PRODUCT_TGZ)
	@mkdir $(TARDIR) -p
	@cp -ai dist/* $(TARDIR)/
	@tar -zcf $(TARNAME) $(TARDIR)
	@cp -ai $(TARNAME) $(BUILD_PRODUCT_TGZ)
	@rm -rf $(PKGDIR)
	@echo "------------------------------------------------"
	@echo "tar file available at: $(TARNAME)"
	@echo "------------------------------------------------"
