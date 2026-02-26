/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as dataMigrations from "../dataMigrations.js";
import type * as lib_actions from "../lib/actions.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_composio from "../lib/composio.js";
import type * as lib_keys from "../lib/keys.js";
import type * as public_ from "../public.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  actions: typeof actions;
  dataMigrations: typeof dataMigrations;
  "lib/actions": typeof lib_actions;
  "lib/auth": typeof lib_auth;
  "lib/composio": typeof lib_composio;
  "lib/keys": typeof lib_keys;
  public: typeof public_;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
