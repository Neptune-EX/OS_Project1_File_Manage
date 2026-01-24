/**
 * 力导向图布局算法
 * 用于知识图谱节点位置计算
 */

import { KnowledgeNode, KnowledgeLink } from './KnowledgeIndex';

// 带坐标的图节点
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  keywords: string[];
  connections: number;
}

// 图边
export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  sharedKeywords: string[];
}

// 布局结果
export interface LayoutResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class GraphLayout {
  private width: number;
  private height: number;
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * 初始化布局
   */
  init(knowledgeNodes: KnowledgeNode[], links: KnowledgeLink[], maxNodes: number = 100): void {
    // 限制节点数量，按连接数排序
    const sortedNodes = knowledgeNodes.slice().sort((a, b) => b.connections - a.connections);
    const limitedNodes = sortedNodes.slice(0, maxNodes);
    const nodeSet = new Set<string>();
    limitedNodes.forEach((n: KnowledgeNode) => nodeSet.add(n.filename));

    // 创建节点
    this.nodes = [];
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    limitedNodes.forEach((node: KnowledgeNode, index: number) => {
      const angle = (index / limitedNodes.length) * Math.PI * 2;
      const radius = Math.min(this.width, this.height) * 0.35;
      this.nodes.push({
        id: node.filename,
        x: centerX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5),
        y: centerY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5),
        vx: 0,
        vy: 0,
        radius: this.calcNodeRadius(node.connections),
        keywords: node.keywords,
        connections: node.connections
      });
    });

    // 过滤边，只保留两端都在节点集中的边，限制数量
    const filteredLinks = links.filter((link: KnowledgeLink) =>
      nodeSet.has(link.source) && nodeSet.has(link.target) && link.strength >= 0.2
    );
    filteredLinks.sort((a, b) => b.strength - a.strength);

    this.edges = filteredLinks.slice(0, 300).map((link: KnowledgeLink): GraphEdge => ({
      source: link.source,
      target: link.target,
      strength: link.strength,
      sharedKeywords: link.sharedKeywords
    }));
  }

  /**
   * 计算节点半径 (连接数 3-30 → 20-50px)
   */
  private calcNodeRadius(connections: number): number {
    const minR = 20, maxR = 50;
    const minC = 3, maxC = 30;
    const c = Math.max(minC, Math.min(maxC, connections));
    return minR + (c - minC) / (maxC - minC) * (maxR - minR);
  }

  /**
   * 运行力导向布局
   */
  run(iterations: number = 50): LayoutResult {
    const repulsion = 5000;
    const attraction = 0.05;
    const damping = 0.9;
    const minDist = 60;

    for (let iter = 0; iter < iterations; iter++) {
      const alpha = 1 - iter / iterations;

      // 斥力：节点间互斥
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const n1 = this.nodes[i];
          const n2 = this.nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion * alpha / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }

      // 引力：连接的节点相互吸引
      this.edges.forEach((edge: GraphEdge) => {
        const n1 = this.findNode(edge.source);
        const n2 = this.findNode(edge.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - minDist) * attraction * edge.strength * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      // 中心引力
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      this.nodes.forEach((node: GraphNode) => {
        node.vx += (centerX - node.x) * 0.01 * alpha;
        node.vy += (centerY - node.y) * 0.01 * alpha;
      });

      // 更新位置
      const padding = 30;
      this.nodes.forEach((node: GraphNode) => {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(padding + node.radius, Math.min(this.width - padding - node.radius, node.x));
        node.y = Math.max(padding + node.radius, Math.min(this.height - padding - node.radius, node.y));
      });
    }

    return { nodes: this.nodes, edges: this.edges };
  }

  private findNode(id: string): GraphNode | null {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].id === id) return this.nodes[i];
    }
    return null;
  }
}
