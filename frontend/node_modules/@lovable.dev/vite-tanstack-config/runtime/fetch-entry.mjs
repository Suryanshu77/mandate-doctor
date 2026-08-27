// The #nitro virtual import and nitro/app resolve inside nitro's rolldown build, not in this package.
import "#nitro/virtual/polyfills";
import { useNitroApp } from "nitro/app";

const nitroApp = useNitroApp();

export default {
  fetch: (request) => nitroApp.fetch(request),
};
