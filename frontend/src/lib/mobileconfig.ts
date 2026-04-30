import type { Config } from "../types/config";

export const generateMobileConfig = (config: Config) => {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  const base64Icon = config.iconBase64
    ? config.iconBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${base64Icon}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${config.name}</string>
            <key>PayloadDescription</key>
            <string>${config.description}</string>
            <key>PayloadDisplayName</key>
            <string>${config.name}</string>
            <key>PayloadIdentifier</key>
            <string>com.webclip.${uuid1}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${uuid1}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${config.url}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>${config.name}</string>
    <key>PayloadIdentifier</key>
    <string>com.webclip.profile.${uuid2}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid2}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;
};
