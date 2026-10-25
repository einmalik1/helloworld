import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@helloworld/ui";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};
