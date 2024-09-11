import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  rem,
  useMantineTheme,
} from '@mantine/core';
import {
  IconLogout,
  IconMessage,
  IconSettings,
  IconChevronDown,
  IconWallet,
  IconPigMoney,
  IconReportMoney,
  IconLock,
  IconHelp,
} from '@tabler/icons-react';
import classes from './HeaderTabs.module.css';
import { auth } from '@/lib/firebase';
import { useUser } from '@/lib/auth';

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" width="150" height="30" style={{ filter: 'grayscale(100%) brightness(0.7)' }}>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#333333', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#666666', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <text x="10" y="45" fontFamily="Poppins, sans-serif" fontSize="40" fontWeight="bold" fill="url(#grad1)">ST</text>
    <text x="80" y="45" fontFamily="Poppins, sans-serif" fontSize="40" fontWeight="bold" fill="#333333">TRADER</text>
    <polyline points="220,30 240,15 260,25 280,10" stroke="#666666" strokeWidth="3" fill="none" />
    <polygon points="280,10 290,20 270,20" fill="#666666" />
  </svg>
);

const tabs = [
  { value: 'dashboard', label: 'Dashboard', href: '/' },
  { value: 'accounts', label: 'Accounts', href: '/accounts' },
  { value: 'transactions', label: 'Transactions', href: '/transactions' },
  { value: 'reports', label: 'Reports', href: '/reports' },
  { value: 'budget', label: 'Budget', href: '/budget' },
  { value: 'recurring', label: 'Recurring', href: '/recurring' },
  { value: 'goals', label: 'Goals', href: '/goals' },
  { value: 'investments', label: 'Investments', href: '/investments' },
  { value: 'advice', label: 'Advice', href: '/advice' },
];

export function HeaderTabs() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const currentTab = tabs.find(tab => tab.href === router.pathname)?.value || 'dashboard';

  const items = tabs.map((tab) => (
    <Tabs.Tab
      key={tab.value}
      value={tab.value}
      onClick={() => router.push(tab.href)}
      className={classes.tab}
    >
      {tab.label}
    </Tabs.Tab>
  ));

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Group justify="space-between">
          <Logo />

          <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />

          {!isLoading && user && (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton className={classes.user}>
                  <Group gap={7}>
                    <Avatar src={user.photoURL} alt={user.displayName || ''} radius="xl" size={20} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user.displayName || user.email}
                    </Text>
                    <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconWallet style={{ width: rem(16), height: rem(16) }} color={theme.colors.blue[6]} stroke={1.5} />
                  }
                >
                  My Portfolios
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconPigMoney style={{ width: rem(16), height: rem(16) }} color={theme.colors.green[6]} stroke={1.5} />
                  }
                >
                  Savings Goals
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconReportMoney style={{ width: rem(16), height: rem(16) }} color={theme.colors.yellow[6]} stroke={1.5} />
                  }
                >
                  Financial Reports
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                >
                  Account settings
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                >
                  Security settings
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Support</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconHelp style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                >
                  Help Center
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessage style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                >
                  Contact Support
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Container>
      <Container size="md">
        <Tabs
          value={currentTab}
          onChange={(value) => router.push(tabs.find(tab => tab.value === value)?.href || '/')}
          variant="outline"
          classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
      </Container>
    </div>
  );
}