# store the current working directory
CWD := $(shell pwd)
PRINT_STATUS = export EC=$$?; cd $(CWD); if [ "$$EC" -eq "0" ]; then printf "SUCCESS!\n"; else exit $$EC; fi

NAME      := kitoon
VERSION   := 0.0.41
RELEASE   := 1
RPMBUILD  := $(HOME)/rpmbuild
TARDIR    := $(NAME)-$(VERSION)
DISTDIR   := $(TARDIR)/dist
TARNAME   := $(TARDIR).tar.gz
KITOON_DIST := ./dist

build-all: build-setup build

build-setup:
	sudo npm install -g gulp
	sudo npm install -g tsd
	sudo npm install -g grunt-cli
	npm install
	tsd install

build: check
	gulp compile --prod
	grunt nggettext_compile

pot:
	gulp tsc
	grunt nggettext_extract

check:
	# Should be 'Language: zh-CN' but not 'Language: zh_CN' in zh_CN.po
	# for Intl.DateTimeFormat() in app/components/base/i18n.ts
	for po in po/*.po ; do \
	    mo="po/`basename $$po .po`.mo"; \
	    msgfmt --check --verbose $$po -o $$mo; \
	    if test "$$?" -ne 0 ; then \
	        exit -1; \
	    fi; \
	    rm $$mo; \
	    name=`echo "$$po" | grep '-'`; \
	    if test "x$$name" != x ; then \
	        right_name=`echo $$language | sed -e 's/-/_/'`; \
	        echo "ERROR: WRONG $$name CORRECTION: $$right_name"; \
	        exit -1; \
	    fi; \
	    language=`grep '^"Language:' "$$po" | grep '_'`; \
	    if test "x$$language" != x ; then \
	        right_language=`echo $$language | sed -e 's/_/-/'`; \
	        echo "ERROR: WRONG $$language CORRECTION: $$right_language in $$po"; \
	        exit -1; \
	    fi; \
	done;

dist: build
	@echo "making dist tarball in $(TARNAME)"
	mkdir -p $(DISTDIR)
	cp README.md $(TARDIR)/.
	cp -r $(KITOON_DIST)/* $(DISTDIR)
	tar -zcf $(TARDIR).tar.gz $(TARDIR);
	rm -rf $(TARDIR)
	@echo "------------------------------------------------"
	@echo "tar file available at: $(TARNAME)"
	@echo "------------------------------------------------"

rpm: dist
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,SOURCES,BUILDROOT}
	cp kitoon.spec $(RPMBUILD)/SPECS
	cp $(TARNAME) $(RPMBUILD)/SOURCES
	rpmbuild -ba kitoon.spec
	@echo "------------------------------------------------------------"
	@echo "Kitoon RPM available at directory:  $(RPMBUILD)/RPMS/noarch"
	@echo "------------------------------------------------------------"
