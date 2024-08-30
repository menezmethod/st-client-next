import { Grid, Paper, Text, Title } from '@mantine/core';
import { IconCurrencyDollar, IconCurrencyBitcoin, IconBuildingBank } from '@tabler/icons-react';

interface Asset {
  name: string;
  value: number;
  change: number;
}

const AssetCard = ({ asset, icon: Icon }: { asset: Asset; icon: React.FC<any> }) => (
  <Paper p="md" radius="md" withBorder>
    <Grid>
      <Grid.Col span={2}>
        <Icon size={24} />
      </Grid.Col>
      <Grid.Col span={10}>
        <Text fw={700}>{asset.name}</Text>
        <Text>${asset.value.toFixed(2)}</Text>
        <Text color={asset.change >= 0 ? 'green' : 'red'}>
          {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
        </Text>
      </Grid.Col>
    </Grid>
  </Paper>
);

export function WatchListContent() {
  const stockAssets: Asset[] = [
    { name: 'AAPL', value: 150.25, change: 1.5 },
    { name: 'GOOGL', value: 2750.80, change: -0.8 },
  ];

  const cryptoAssets: Asset[] = [
    { name: 'BTC', value: 45000, change: 2.3 },
    { name: 'ETH', value: 3200, change: -1.2 },
  ];

  const otherAssets: Asset[] = [
    { name: 'Gold', value: 1800, change: 0.5 },
    { name: 'Real Estate', value: 500000, change: 3.1 },
  ];

  return (
    <Grid gutter="md">
      <Grid.Col span={4}>
        <Title order={3} mb="md">Stocks</Title>
        {stockAssets.map((asset) => (
          <AssetCard key={asset.name} asset={asset} icon={IconCurrencyDollar} />
        ))}
      </Grid.Col>
      <Grid.Col span={4}>
        <Title order={3} mb="md">Crypto</Title>
        {cryptoAssets.map((asset) => (
          <AssetCard key={asset.name} asset={asset} icon={IconCurrencyBitcoin} />
        ))}
      </Grid.Col>
      <Grid.Col span={4}>
        <Title order={3} mb="md">Other Assets</Title>
        {otherAssets.map((asset) => (
          <AssetCard key={asset.name} asset={asset} icon={IconBuildingBank} />
        ))}
      </Grid.Col>
    </Grid>
  );
}