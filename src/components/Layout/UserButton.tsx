import React from 'react';
import { UnstyledButton, Group, Avatar, Text } from '@mantine/core';

export function UserButton() {
  return (
    <UnstyledButton>
      <Group>
        <Avatar src="https://example.com/avatar.png" radius="xl" />
        <div>
          <Text size="sm" fw={500}>
            Jane Doe
          </Text>
          <Text c="dimmed" size="xs">
            jane@example.com
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}