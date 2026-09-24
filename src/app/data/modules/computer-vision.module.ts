import { Module } from '../../core/models/content.models';

export const computerVisionModule: Module = {
  slug: 'computer-vision',
  title: 'Computer Vision',
  short: 'Vision',
  stage: 7,
  level: 'intermediate',
  tagline: 'Images as tensors, convolution, CNNs, detection and vision transformers.',
  description:
    'Vision is where deep learning first broke through, and convolution is still the clearest ' +
    'illustration of why architecture matters. This stage also introduces transfer learning — the ' +
    'idea that pretrained representations are reusable — which is the foundation of everything in ' +
    'the LLM stages.',
  topics: [
    {
      slug: 'images-and-convolution',
      title: 'Images as tensors, and what convolution does',
      module: 'computer-vision',
      level: 'intermediate',
      minutes: 9,
      summary: 'Pixel grids, channels, kernels, stride and padding — the operation itself.',
      why: 'A fully connected layer on a 224x224 image needs 150,528 weights per unit and learns nothing about locality. Convolution encodes the assumption that nearby pixels are related, which is why it works.',
      prerequisites: ['neural-network-basics'],
      outcomes: [
        'Read an image tensor shape and channel order',
        'Compute a convolution output size',
        'Explain weight sharing and translation equivariance',
      ],
      tags: ['cnn', 'convolution', 'images'],
      blocks: [
        {
          kind: 'text',
          body: 'An RGB image is a tensor of shape `(3, H, W)` — three channels of intensity values, usually scaled to [0, 1] or standardised per channel. A batch adds a leading dimension: `(N, 3, H, W)` in PyTorch, `(N, H, W, 3)` in TensorFlow.',
        },
        { kind: 'visual', id: 'convolution', caption: 'Slide the kernel over the input and watch each output value being computed.' },
        {
          kind: 'text',
          body: 'A convolution slides a small kernel over the image, computing a dot product at each position. The same kernel is used everywhere — **weight sharing** — so an edge detector learned in one corner works in all of them, and the parameter count depends on kernel size rather than image size.',
        },
        {
          kind: 'math',
          expr: 'out = floor((in + 2·padding − kernel) / stride) + 1',
          note: 'A 3x3 kernel with padding 1 and stride 1 preserves the spatial size — which is why that combination is everywhere.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Shapes through a small convolutional stack',
          code: `import torch
from torch import nn

x = torch.randn(8, 3, 32, 32)                      # batch of 8 CIFAR-sized images

conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1) # -> (8, 16, 32, 32)
pool = nn.MaxPool2d(2)                             # -> (8, 16, 16, 16)
conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)

h = pool(torch.relu(conv1(x)))
h = pool(torch.relu(conv2(h)))                     # -> (8, 32, 8, 8)

print(h.shape, sum(p.numel() for p in conv1.parameters()), "params in conv1")
# torch.Size([8, 32, 8, 8]) 448 params in conv1`,
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Pooling throws away position deliberately',
          body: 'Max pooling keeps the strongest response in each window and discards where exactly it was. That buys a little translation invariance and shrinks the tensor; modern architectures often use strided convolutions instead, which learn the downsampling.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cv-1',
            prompt: 'Input 64x64, kernel 5x5, stride 2, padding 0. Output spatial size?',
            options: ['32x32', '30x30', '60x60', '31x31'],
            answer: 1,
            explanation: 'floor((64 + 0 − 5) / 2) + 1 = floor(29.5) + 1 = 30. Without padding, each convolution shrinks the map.',
          },
        },
      ],
      resources: [
        { label: 'CS231n convolutional networks notes', url: 'https://cs231n.github.io/convolutional-networks/', kind: 'course' },
        { label: 'PyTorch Conv2d reference', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html', kind: 'docs' },
      ],
      related: ['cnn-architectures', 'neural-network-basics'],
    },
    {
      slug: 'cnn-architectures',
      title: 'CNN architectures and feature hierarchies',
      module: 'computer-vision',
      level: 'intermediate',
      minutes: 8,
      summary: 'How depth builds edges into textures into objects, and what the landmark architectures contributed.',
      why: 'The feature hierarchy is the reason pretrained vision models transfer so well: the early layers learn things every image task needs.',
      prerequisites: ['images-and-convolution'],
      outcomes: [
        'Describe what early, middle and late layers represent',
        'Name what ResNet, Inception and EfficientNet each fixed',
        'Choose a backbone for a given constraint',
      ],
      tags: ['cnn', 'resnet', 'architecture'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**Early layers** — edges, colour transitions, simple gradients. Almost task independent.',
            '**Middle layers** — textures, corners, repeated motifs.',
            '**Late layers** — object parts and whole objects; here the features become task specific.',
          ],
        },
        {
          kind: 'table',
          head: ['Architecture', 'Contribution'],
          rows: [
            ['LeNet-5 (1998)', 'The convolution + pooling + dense template'],
            ['AlexNet (2012)', 'Depth on GPUs with ReLU and dropout; started the era'],
            ['VGG (2014)', 'Showed that stacking 3x3 convolutions is enough'],
            ['Inception (2014)', 'Parallel kernel sizes; 1x1 convolutions to cut cost'],
            ['ResNet (2015)', 'Residual connections — made 50+ layers trainable'],
            ['MobileNet (2017)', 'Depthwise separable convolutions for phones'],
            ['EfficientNet (2019)', 'Principled scaling of depth, width and resolution together'],
            ['ConvNeXt (2022)', 'Modernised CNN matching transformer accuracy'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'You will rarely design one',
          body: 'In practice you pick a pretrained backbone that fits your latency and memory budget, and fine-tune it. Architecture knowledge is for reading papers, debugging, and choosing sensibly — not for inventing a new network on a deadline.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cv-2',
            prompt: 'What problem did residual connections solve?',
            options: [
              'Slow inference',
              'Gradients vanishing through very deep stacks, which capped useful depth',
              'Overfitting on small datasets',
              'GPU memory limits',
            ],
            answer: 1,
            explanation:
              'Before ResNet, adding layers past ~20 made training error worse. A skip connection gives gradients an unobstructed path backwards, so depth became an asset again.',
          },
        },
      ],
      resources: [
        { label: 'Deep Residual Learning (ResNet) paper', url: 'https://arxiv.org/abs/1512.03385', kind: 'paper' },
        { label: 'torchvision models', url: 'https://docs.pytorch.org/vision/stable/models.html', kind: 'docs' },
      ],
      related: ['transfer-learning-and-vits', 'detection-and-segmentation'],
    },
    {
      slug: 'detection-and-segmentation',
      title: 'Detection and segmentation',
      module: 'computer-vision',
      level: 'advanced',
      minutes: 8,
      summary: 'Beyond "what is in this image": where it is, and which pixels belong to it.',
      why: 'Most commercial vision work is detection or segmentation, not plain classification. The evaluation metrics are different too, and IoU-based metrics are a frequent interview topic.',
      prerequisites: ['cnn-architectures'],
      outcomes: [
        'Distinguish classification, detection and the segmentation variants',
        'Explain IoU, mAP and non-maximum suppression',
        'Pick an approach for a given accuracy/latency budget',
      ],
      tags: ['detection', 'segmentation', 'yolo', 'iou'],
      blocks: [
        {
          kind: 'table',
          head: ['Task', 'Output', 'Typical models'],
          rows: [
            ['Classification', 'One label per image', 'ResNet, ConvNeXt, ViT'],
            ['Object detection', 'Boxes + labels + scores', 'YOLO family, Faster R-CNN, DETR'],
            ['Semantic segmentation', 'A class per pixel', 'U-Net, DeepLab, SegFormer'],
            ['Instance segmentation', 'A mask per object instance', 'Mask R-CNN, SAM-style models'],
            ['Keypoint / pose', 'Landmark coordinates', 'HRNet, pose estimators'],
          ],
        },
        {
          kind: 'text',
          body: '**IoU** (intersection over union) measures box or mask overlap; a prediction usually counts as correct above 0.5. **mAP** averages precision across recall levels and classes. **Non-maximum suppression** removes duplicate boxes for the same object by keeping the highest-scoring one and dropping overlapping neighbours.',
        },
        {
          kind: 'math',
          expr: 'IoU = area(overlap) / area(union)',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'IoU for two boxes in (x1, y1, x2, y2) form',
          code: `def iou(a: tuple[float, ...], b: tuple[float, ...]) -> float:
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[2], b[2]), min(a[3], b[3])

    overlap = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    if overlap == 0.0:
        return 0.0

    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return overlap / (area_a + area_b - overlap)


assert iou((0, 0, 10, 10), (0, 0, 10, 10)) == 1.0
assert iou((0, 0, 10, 10), (20, 20, 30, 30)) == 0.0
print(round(iou((0, 0, 10, 10), (5, 5, 15, 15)), 3))   # 0.143`,
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Annotation is the real cost',
          body: 'Boxes are perhaps ten times cheaper to label than pixel masks. Before choosing instance segmentation, check whether boxes answer the business question — the budget difference is usually larger than the accuracy difference.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cv-3',
            prompt: 'Your detector returns five overlapping boxes for one car. What is missing?',
            options: [
              'More training data',
              'Non-maximum suppression at inference',
              'A larger backbone',
              'Higher input resolution',
            ],
            answer: 1,
            explanation:
              'Detectors propose many candidate boxes by design. NMS keeps the best-scoring box per object and suppresses those overlapping it above an IoU threshold.',
          },
        },
      ],
      resources: [
        { label: 'torchvision detection reference', url: 'https://docs.pytorch.org/vision/stable/models.html#object-detection', kind: 'docs' },
        { label: 'U-Net paper', url: 'https://arxiv.org/abs/1505.04597', kind: 'paper' },
      ],
      related: ['transfer-learning-and-vits', 'classification-metrics'],
    },
    {
      slug: 'transfer-learning-and-vits',
      title: 'Transfer learning and vision transformers',
      module: 'computer-vision',
      level: 'intermediate',
      minutes: 8,
      summary: 'Reusing pretrained representations, and how the transformer arrived in vision.',
      why: 'Transfer learning is the single highest-leverage technique in applied deep learning: it turns "I need a million labelled images" into "I need a few thousand". It is also the exact mental model for fine-tuning an LLM.',
      prerequisites: ['cnn-architectures'],
      outcomes: [
        'Choose between feature extraction and full fine-tuning',
        'Fine-tune a pretrained backbone correctly',
        'Explain how a ViT turns an image into tokens',
      ],
      tags: ['transfer learning', 'vit', 'fine-tuning', 'clip'],
      blocks: [
        {
          kind: 'table',
          head: ['Strategy', 'What trains', 'Use when'],
          rows: [
            ['Feature extraction', 'A new head only; backbone frozen', 'Few hundred images; similar domain'],
            ['Partial fine-tuning', 'Head + last block(s)', 'A few thousand images'],
            ['Full fine-tuning', 'Everything, low learning rate', 'Tens of thousands of images, or a domain shift (x-rays, satellite)'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Feature extraction with a pretrained ResNet',
          code: `import torch
from torch import nn
from torchvision import models

backbone = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

for param in backbone.parameters():
    param.requires_grad = False                     # freeze the representation

backbone.fc = nn.Linear(backbone.fc.in_features, num_classes)   # new head, trainable

optimiser = torch.optim.AdamW(backbone.fc.parameters(), lr=1e-3)`,
        },
        { kind: 'heading', text: 'Vision transformers' },
        {
          kind: 'text',
          body: 'A ViT cuts the image into fixed patches (16x16 is common), flattens each into a vector, adds a positional embedding, and feeds the sequence to a standard transformer encoder. There is no convolution and no built-in locality bias — so ViTs need more data than CNNs, and given that data they scale further.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'CLIP and joint embedding spaces',
          body: 'Contrastively trained image/text models place pictures and captions in one vector space, which makes zero-shot classification and text-to-image search possible without task-specific training. This is also the mechanism behind multimodal LLM inputs.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cv-4',
            prompt: 'You have 800 labelled product photos. Best approach?',
            options: [
              'Train a CNN from scratch',
              'Freeze a pretrained backbone and train a new classification head',
              'Train a ViT from scratch',
              'Use k-means on raw pixels',
            ],
            answer: 1,
            explanation:
              '800 images is far too few to learn visual features from nothing. A pretrained backbone already has them; you only need to learn the mapping from those features to your classes.',
          },
        },
      ],
      resources: [
        { label: 'An Image is Worth 16x16 Words (ViT)', url: 'https://arxiv.org/abs/2010.11929', kind: 'paper' },
        { label: 'PyTorch transfer learning tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html', kind: 'docs' },
        { label: 'CLIP paper', url: 'https://arxiv.org/abs/2103.00020', kind: 'paper' },
      ],
      related: ['embeddings-explained', 'when-to-fine-tune'],
    },
  ],
};
