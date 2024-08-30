import React, { useState, useEffect } from 'react';
import { Stack, Text, UnstyledButton, Paper, Collapse, Group } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconGripVertical } from '@tabler/icons-react';
import classes from './RightSidebar.module.css';

const sidebarItems = [
  { label: 'Stocks', value: '$10,000' },
  { label: 'Crypto', value: '$5,000' },
  { label: 'Cash', value: '$2,000' },
  { label: 'Total Value', value: '$17,000' },
];

const topStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$150.25', change: '+2.5%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$2,750.00', change: '-0.8%' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$305.50', change: '+1.2%' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: '$3,400.75', change: '+0.5%' },
  { symbol: 'FB', name: 'Meta Platforms, Inc.', price: '$330.25', change: '-1.5%' },
];

const watchLists = [
  { name: 'Tech Stocks', count: 10 },
  { name: 'Dividend Stocks', count: 15 },
  { name: 'Crypto', count: 5 },
];

const reports = [
  { name: 'Monthly Performance', date: '2023-05-01' },
  { name: 'Quarterly Report', date: '2023-04-01' },
  { name: 'Annual Summary', date: '2023-01-01' },
];

const latestTrades = [
  { symbol: 'TSLA', action: 'Buy', quantity: 10, price: '$700.00' },
  { symbol: 'NVDA', action: 'Sell', quantity: 5, price: '$450.50' },
  { symbol: 'AAPL', action: 'Buy', quantity: 20, price: '$152.75' },
];

const latestPrices = [
  { name: 'US 10Y Treasury', value: '1.5%' },
  { name: 'Corporate Bond ETF', value: '$110.25' },
  { name: 'High Yield Bond ETF', value: '$85.50' },
  { name: 'Municipal Bond ETF', value: '$112.75' },
];

const defaultSections = [
  { id: 'portfolio', title: 'Portfolio Overview', items: sidebarItems },
  { id: 'stocks', title: 'Top Stocks', items: topStocks },
  { id: 'watchlists', title: 'Watch Lists', items: watchLists },
  { id: 'reports', title: 'Reports', items: reports },
  { id: 'latestTrades', title: 'Latest Trades', items: latestTrades },
  { id: 'latestPrices', title: 'Latest Prices', items: latestPrices },
];

const STORAGE_KEY = 'sidebarSectionOrder';

export function RightSidebar() {
  const [sections, setSections] = useState(defaultSections);
  const [closedSections, setClosedSections] = useState<string[]>([]);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);

  useEffect(() => {
    const loadSavedState = () => {
      const storedOrder = localStorage.getItem(STORAGE_KEY);
      const storedClosedSections = localStorage.getItem('closedSections');
      
      if (storedOrder) {
        const orderIds = JSON.parse(storedOrder) as string[];
        const orderedSections = orderIds
          .map(id => defaultSections.find(s => s.id === id))
          .filter((s): s is typeof defaultSections[number] => s !== undefined);
        setSections(orderedSections);
      }

      if (storedClosedSections) {
        setClosedSections(JSON.parse(storedClosedSections));
      }
    };

    loadSavedState();
  }, []);

  useEffect(() => {
    const saveSectionOrder = () => {
      const orderIds = sections.map(section => section.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
    };

    saveSectionOrder();
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('closedSections', JSON.stringify(closedSections));
  }, [closedSections]);

  const toggleSection = (sectionId: string) => {
    setClosedSections(current =>
      current.includes(sectionId)
        ? current.filter(id => id !== sectionId)
        : [...current, sectionId]
    );
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSection(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedSection];
    newSections.splice(draggedSection, 1);
    newSections.splice(index, 0, draggedItem);
    
    setSections(newSections);
    setDraggedSection(index);
  };

  const onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSection(null);
  };

  const renderSectionContent = (section: typeof defaultSections[number]) => {
    switch (section.id) {
      case 'latestTrades':
        return section.items.map((item) => (
          'action' in item && (
            <Group key={item.symbol} justify="space-between">
              <Text size="sm" fw={500}>{item.symbol}</Text>
              <Text size="sm">{item.action} {item.quantity} @ {item.price}</Text>
            </Group>
          )
        ));
      case 'latestPrices':
        return section.items.map((item) => (
          <Group key={('name' in item ? item.name : 'symbol' in item ? item.symbol : '')} justify="space-between">
            <Text size="sm" fw={500}>{('name' in item ? item.name : 'symbol' in item ? item.symbol : '')}</Text>
            <Text size="sm">{('value' in item ? item.value : 'price' in item ? item.price : '')}</Text>
          </Group>
        ));
      default:
        return section.items.map((item) => (
          <Group key={('label' in item ? item.label : '') || ('symbol' in item ? item.symbol : '') || ('name' in item ? item.name : '')} justify="space-between">
            <div>
              <Text size="sm" fw={500}>{('label' in item ? item.label : '') || ('symbol' in item ? item.symbol : '') || ('name' in item ? item.name : '')}</Text>
              {'name' in item && 'symbol' in item && <Text size="xs" c="dimmed">{item.name}</Text>}
            </div>
            <div>
              <Text size="sm" ta="right">{('value' in item ? item.value : '') || ('price' in item ? item.price : '') || ('count' in item ? `${item.count} items` : '') || ('date' in item ? item.date : '')}</Text>
              {'change' in item && (
                <Text size="xs" c={item.change.startsWith('+') ? 'green' : 'red'} ta="right">
                  {item.change}
                </Text>
              )}
            </div>
          </Group>
        ));
    }
  };

  return (
    <Stack gap="md" className={classes.sidebar}>
      {sections.map((section, index) => (
        <Paper
          key={section.id}
          shadow="sm"
          p="md"
          radius="md"
          className={classes.floatingSection}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
        >
          <Group justify="space-between" mb="xs">
            <UnstyledButton
              onClick={() => toggleSection(section.id)}
              className={classes.sectionHeader}
              style={{ flex: 1 }}
            >
              <Group justify="space-between">
                <Text fw={500}>{section.title}</Text>
                {!closedSections.includes(section.id) ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />}
              </Group>
            </UnstyledButton>
            <UnstyledButton style={{ cursor: 'grab' }}>
              <IconGripVertical size="1rem" />
            </UnstyledButton>
          </Group>
          <Collapse in={!closedSections.includes(section.id)}>
            <Stack gap="xs" mt="xs">
              {renderSectionContent(section)}
            </Stack>
          </Collapse>
        </Paper>
      ))}
    </Stack>
  );
}