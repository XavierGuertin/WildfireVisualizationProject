<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Color Polygon</Name>
    <UserStyle>
      <Title>A red polygon style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>red polygon</Title>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ffbebe</CssParameter>
              <CssParameter name="fill-opacity">0.7</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#fe3a3a</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>

        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>