/* eslint-disabled capitalized-comments */

declare module "react-fuzzy" {
  import {CSSProperties, ReactElement} from "react";

  export interface FuzzySearchProps {
    /**
     * Indicates whether comparisons should be case sensitive.
     * @defaultValue `false`
     */
    caseSensitive?: boolean;

    /**
     * give a custom class name to the root element
     * @defaultValue `null`
     */
    className?: string|null;

    /**
     * Styles passed directly to the `input` element.
     * @defaultValue `{}`
     */
    inputStyle?: CSSProperties;

    /**
     * Styles passed directly to the `input` wrapper `div`.
     * @defaultValue `{}`
     */
    inputWrapperStyle?: CSSProperties;

    /**
     * Styles passed to each item in the dropdown list.
     * @defaultValue `{}`
     */
    listItemStyle?: CSSProperties;

    /**
     * Styles passed directly to the dropdown wrapper.
     * @defaultValue `{}`
     */
    listWrapperStyle?: CSSProperties;

    /**
     * Styles passed directly to current 'active' item.
     * @defaultValue `{}`
     */
    selectedListItemStyle?: CSSProperties;

     /**
     * width of the fuzzy searchbox
     * @defaultValue `430`
     */
    width?: string|number;

    distance?: number;

    id?: string|null;

    include?: any[];

    maxPatternLength?: number;

    onSelect?: Function;

    keyForDisplayName?: string

    keys?: any[];

    list?: any[]|null;

    maxResults?: number;

    placeholder?: string;

    resultsTemplate?: unknown;

    shouldShowDropdownAtStart?: boolean;

    shouldSort?: boolean;

    sortFn?: (a: any, b: any) => number;

    threshold?: number;

    tokenize?: boolean;

    verbose?: boolean;
  }

  const FuzzySearch: (props: FuzzySearchProps) => ReactElement;

  export default FuzzySearch;
}
