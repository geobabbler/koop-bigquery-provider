# Koop BigQuery Provider

## Pre-Flight

In order to work with BigQuery, you should address the prerequisites listed in the "Before You Begin" section [here](https://github.com/googleapis/nodejs-bigquery#quickstart).

This provider uses a service account for BigQuery authentication. Rename your service account JSON file to 'serviceKey.json' and place it in the "gcloud" directory. 

![ArcGIS Pro](./assets/arcgis_pro_koop_bigquery.png =300x)


## Configuration

The file 'config/default.json' looks like this:

```json
{
  "gcloud": {
    "project": "",
    "geometry": "shape",
    "region": "US"
  }
}
```

If your service account accesses only one Google Cloud project (recommended), you can leave the "project" setting as an empty string. Otherwise, you need to specify a single project with this setting. This provier only supports a single project.

The "geometry" setting specifies a standard alias for the geography column being rendered. If your table contains more than one geography column, the layer parameter in the GeoServices URL will specify the ordinal of the column to be rendered. This provider does not currently support named spatial columns. In the following URL, the integer '0' is specifying the spatial column. The BigQuery dataset and table name are supplied in the URL to specify the table to query.

```
https://localhost/bigquery/services/${dataset}.${table}/FeatureServer/0/query
```

The "region: setting specifies the Google Cloud [location](https://cloud.google.com/bigquery/docs/locations) in which your data is stored.

## Running the Server
- `npm install`
- `npm start`