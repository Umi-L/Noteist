import {Architecture, Mode, Neutralino, OperatingSystem} from "./neutralino";

declare global {
    const Neutralino: Neutralino;
    /** Mode of the application: window, browser, cloud, or chrome */
    const NL_MODE: Mode;
    /** Application port */
    const NL_PORT: number;
    /** Command-line arguments */
    const NL_ARGS: string[];
    /** Basic authentication token */
    const NL_TOKEN: string;
    /** Neutralinojs client version */
    const NL_CVERSION: string;
    /** Application identifier */
    const NL_APPID: string;
    /** Application version */
    const NL_APPVERSION: string;
    /** Application path */
    const NL_PATH: string;
    /** Returns true if extensions are enabled */
    const NL_EXTENABLED: boolean;
    /** Operating system name: Linux, Windows, Darwin, FreeBSD, or Uknown */
    const NL_OS: OperatingSystem;
    /** CPU architecture: x64, arm, itanium, ia32, or unknown */
    const NL_ARCH: Architecture;
    /** Neutralinojs server version */
    const NL_VERSION: string;
    /** Current working directory */
    const NL_CWD: string;
    /** Identifier of the current process */
    const NL_PID: string;
    /** Source of application resources: bundle or directory */
    const NL_RESMODE: string;
    /** Release commit of the client library */
    const NL_CCOMMIT: string;
    /** An array of custom methods */
    const NL_CMETHODS: string[];

}