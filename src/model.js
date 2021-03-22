/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/usage/provider */
// const request = require('request').defaults({ gzip: true, json: true })
const _ = require('lodash')
const config = require('config')
const { BigQuery } = require('@google-cloud/bigquery')
const bigquery = new BigQuery()

function Model (koop) { }

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// Config parameters (config/default.json)
// req.
//
// URL path parameters:
// req.params.host (if index.js:hosts true)
// req.params.id  (if index.js:disableIdParam false)
// req.params.layer
// req.params.method
Model.prototype.getData = async function (req, callback) {
  const splitPath = req.params.id.split('.')
  const dataset = splitPath[0]
  const table = splitPath[1]
  let spatialCol = null

  // pre-flight checks
  // if (!req.params.layer) callback(new Error('Layer not specified'))
  // if (isNaN(parseInt(req.params.layer, 10))) callback(new Error('Layer must be an integer'))
  if (!table) callback(new Error('The "id" parameter must be in the form of "dataset.table"')) // thanks Dan O'Neill
  // if (!req.params.method) callback(new Error('Method not specified'))
  // if (req.params.method.toLowerCase() !== 'query') callback(new Error(`Method ${req.params.method} not supported`))

  const layerNum = parseInt(req.params.layer, 10)
  process.env.GOOGLE_CLOUD_PROJECT = config.gcloud.project
  process.env.GOOGLE_APPLICATION_CREDENTIALS = './gcloud/serviceKey.json'
  const id = process.env.PG_OBJECTID || 'gid'

  async function doQuery () {
    // Queries the view to get stops along the route.
    spatialCol = await getSpatialColumn(dataset, table, layerNum)
    if (!spatialCol) throw new Error('Specified table has no spatial column')
    if (spatialCol === '-1') return {}
    if (spatialCol === '-999') throw new Error('Specified layer does not exist')
    console.log(spatialCol)
    const query = `SELECT st_asgeojson(${spatialCol})as ${config.gcloud.geometry},  * EXCEPT(${spatialCol}), ROW_NUMBER() OVER() AS gid FROM \`${dataset}.${table}\``
    console.log(query)
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US'
    }

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options)
    console.log(`Job ${job.id}started.`)

    // Wait for the query to finish
    const [rows] = await job.getQueryResults()

    // return the results
    return rows
  }
  // [END bigquery_query]

  // translate the response into geojson
  try {
    const geojson = translate(await doQuery())
    if (geojson.metadata === undefined || geojson.metadata === null) {
      geojson.metadata = {}
    }

    geojson.metadata.title = geojson.metadata.name = dataset + '.' + table
    geojson.metadata.description = 'GeoJSON from PostGIS ' + dataset + '.' + table
    geojson.metadata.idField = id
    geojson.metadata.geometryType = _.get(geojson, 'features[0].geometry.type')
    // hand off the data to Koop
    callback(null, geojson)
  } catch (e) {
    console.log(e)
    callback(e)
  }
}

function translate (input) {
  let feats = []
  if (input.map) {
    feats = input.map(formatFeature)
  }
  // console.log(input);
  return {
    type: 'FeatureCollection',
    features: feats
  }
}

function formatFeature (inputFeature) {
  // get geometry
  const shapeVal = JSON.parse(inputFeature[config.gcloud.geometry])
  // remove geometry from attributes
  delete inputFeature[config.gcloud.geometry]
  // still need to process BigQuery dates
  for (const item in inputFeature) {
    // console.log(item)
    if (inputFeature[item].value) inputFeature[item] = inputFeature[item].value
  }
  const feature = {
    type: 'Feature',
    properties: inputFeature,
    geometry: shapeVal
  }
  return feature
}

// Function to determin the name of the spatial column for a table.
// Queries information schema. If the table has multiple spatial columns, Koop layer parameter is used to determine column.
async function getSpatialColumn (dataset, table, layerNum) {
  console.log(layerNum)
  // if (layerNum === undefined || layerNum === null || isNaN(layerNum)) {
  //  return '-1'
  // }
  layerNum = 0
  const query = `SELECT column_name FROM ${dataset}.INFORMATION_SCHEMA.COLUMNS where data_type = 'GEOGRAPHY' and table_name = '${table}';`
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US'
  }
  const [job] = await bigquery.createQueryJob(options)
  console.log(`Job ${job.id}started.`)

  // Wait for the query to finish
  const [rows] = await job.getQueryResults()
  if (layerNum > (rows.length - 1)) return '-999'
  console.log(rows)
  if (rows.length > 0) {
    return rows[layerNum].column_name
  } else {
    return null
  }
}

module.exports = Model
