export const createItemAssetStyle = (layerName: string, min: number, max: number) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd" version="1.0.0">
      <NamedLayer>
        <Name>${layerName}</Name>
        <UserStyle>
          <Name>raster</Name>
          <Title>Opaque Raster</Title>
          <Abstract>A sample style for rasters</Abstract>
          <FeatureTypeStyle>
            <FeatureTypeName>Feature</FeatureTypeName>
            <Rule>
              <RasterSymbolizer>
                <Opacity>0.5</Opacity>
                <ChannelSelection>
                  <GrayChannel>
                    <SourceChannelName>1</SourceChannelName>
                  </GrayChannel>
                </ChannelSelection>
                <ColorMap type="ramp">
                  <ColorMapEntry color="#0000ff" quantity="${min}"/>
                  <ColorMapEntry color="#ff0000" quantity="${max}"/>
                </ColorMap>
              </RasterSymbolizer>
            </Rule>
          </FeatureTypeStyle>
        </UserStyle>
      </NamedLayer>
    </StyledLayerDescriptor>`;
  }