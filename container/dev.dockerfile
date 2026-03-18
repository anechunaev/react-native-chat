FROM alpine:3.23

ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

RUN apk add --no-cache \
	bash \
	git \
	curl \
	wget \
	unzip \
	libc6-compat \
	python3 \
	make \
	g++ \
	nodejs-current \
	npm \
	openjdk17 \
	gradle \
	android-tools \
	tzdata

COPY --from=icalialabs/watchman:4-alpine3.4 /usr/local/bin/watchman* /usr/local/bin/
RUN mkdir -p /usr/local/var/run/watchman && touch /usr/local/var/run/watchman/.not-empty

RUN npm install -g \
	expo \
	eas-cli \
	react-native-cli

RUN mkdir -p $ANDROID_HOME/cmdline-tools

RUN wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/tools.zip \
	&& unzip /tmp/tools.zip -d $ANDROID_HOME/cmdline-tools \
	&& mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
	&& rm /tmp/tools.zip

RUN yes | sdkmanager --licenses

RUN sdkmanager \
	"platform-tools" \
	"platforms;android-34" \
	"build-tools;34.0.0"

RUN echo fs.inotify.max_user_watches=524288 > /etc/sysctl.d/99-watchers.conf || true

WORKDIR /workspace

COPY container/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 9229

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]