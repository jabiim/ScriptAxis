import {useState, useEffect} from 'react'
import ScriptGrid from '../components/ScriptGrid'
import ScriptUtils from '../utilities/ScriptUtils'
import Head from 'next/head'
import Filters from './Filters'
import Sorting from './Sorting'
import style from './BrowseScripts.module.css'
import Router from 'next/router'

const BrowseScripts = ({propScripts, tags, categories, query}) => {
    const [scripts, setScripts] = useState([]);
    const [cachedFilters, setCachedFilters] = useState({...query.filters});
    const [cachedSorting, setCachedSorting] = useState([{created:"desc"}]);
    const [customFilters, setCustomFilters] = useState(false);
    
    useEffect(() => {
        setScripts(propScripts);
    }, [propScripts])

    const getHeadTitle = query => {
        if(customFilters) return "Filtered Scripts";
        if(query.filters.name) return `Results for '${query.filters.name.contains}'`;
        if(query.filters.category) return `Category: ${query.filters.category.name.equals}`;
        if(query.filters.include) return `Tag: ${query.filters.include[0]}`;
        return "Scripts";
    }

    const getBodyTitle = query => {
        if(customFilters) return "Filtered Scripts";
        if(query.filters.name) return `Scripts matching "${query.filters.name.contains}"`;
        if(query.filters.category) return `${query.filters.category.name.equals} Scripts`;
        if(query.filters.include) return `Scripts tagged with "${query.filters.include[0]}"`;
        return "All Scripts";
    }

    const handleFilters = filters => {
        setCachedFilters(filters);
        const params = ScriptUtils.objectToQuery({filters, sorting: cachedSorting});
        const newParamString = ScriptUtils.queryToString(params);
        if(newParamString && newParamString !== "") {
            console.log("BrowseScripts: New params, navigating", newParamString);
            Router.push("/scripts" + newParamString);
        } else if(newParamString === "" && Object.keys(filters).length === 0) {
            console.log("BrowseScripts: No params, navigating to /scripts");
            Router.push("/scripts")
        } else {
            console.log("BrowseScripts: No change to params");
        }
    }

    const handleSort = sorting => {
        setCachedSorting(sorting);
        const params = ScriptUtils.objectToQuery({filters: cachedFilters, sorting});
        const newParamString = ScriptUtils.queryToString(params);
        if(newParamString && newParamString !== "") {
            console.log("BrowseScripts: New params, navigating", newParamString);
            Router.push("/scripts" + newParamString);
        } else if(newParamString === "" && Object.keys(filters).length === 0) {
            console.log("BrowseScripts: No params, navigating to /scripts");
            Router.push("/scripts")
        } else {
            console.log("BrowseScripts: No change to params");
        }
    }

    return (
        <div>
            <Head>
                <title>ScriptAxis | {getHeadTitle(query)}</title>
            </Head>
            <div className={style.browsescripts}>
                <Filters tags={tags} categories={categories} onFilter={handleFilters} query={query} />
                <div>
                    <div className={style.tileheader}>
                        <h1>{getBodyTitle(query)}</h1>
                        <Sorting onSort={handleSort} />
                    </div>
                    {!scripts || scripts.length === 0 ? (
                        <div className={style.noscripts}>
                            <p>No scripts match your selected filters</p>
                        </div>
                    ) : (
                        <ScriptGrid scripts={scripts} customStyle={{
                            gridTemplateColumns: `repeat(3, 1fr)`
                        }} />
                    )}
                    
                </div>
            </div>
        </div>
    )
}

export default BrowseScripts;