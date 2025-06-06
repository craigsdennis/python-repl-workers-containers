import {env} from "cloudflare:workers";
import { Container, getContainer } from 'cf-containers';


export class PythonReplContainer extends Container {
  defaultPort = 8080;
  sleepAfter = '10m';
}

export default {
  fetch(request) {
		return getContainer(env.PYTHON_REPL_CONTAINER).fetch(request);
  },
} satisfies ExportedHandler<Env>;
