#
# Kitoon Spec File
#

Name:kitoon
Version: %{version}
Release: %{?revision}%{?dist}
Summary:Calamari GUI front-end components
License: MIT
Group:   System/Filesystems
Source0: %{name}_%{version}.tar.gz
%description
Contains the JavaScript GUI content for the skyring frontend components
(dashboard, login screens, administration screens)

%prep
echo "prep"

%install
 echo "install"
mkdir -p %{buildroot}
cd %{buildroot}
tar xfz %{tarname}

%clean
echo "clean"
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"

%files -n kitoon
/usr/share/skyring/webapp/*

%changelog
* Thu Dec 04 2015 <tjeyasin@redhat.com>
- Initial build.
