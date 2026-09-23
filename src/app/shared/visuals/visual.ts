import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VisualId } from '../../core/models/content.models';
import { ActivationsVisual, BiasVarianceVisual, GradientDescentVisual } from './math.visuals';
import { ConfusionMatrixVisual, TreeSplitsVisual } from './ml.visuals';
import { ConvolutionVisual, NeuralNetVisual, PerceptronVisual } from './dl.visuals';
import {
  AttentionVisual,
  EmbeddingsVisual,
  SamplingVisual,
  TokenizerVisual,
  TransformerVisual,
} from './llm.visuals';
import {
  BackpropVisual,
  KMeansVisual,
  ThresholdVisual,
  TrainingCurveVisual,
} from './animated.visuals';
import {
  AdaptationCompareVisual,
  AgentLoopVisual,
  RagPipelineVisual,
  VectorSearchVisual,
} from './system.visuals';

/**
 * The figure registry.
 *
 * A `{ kind: 'visual', id }` content block names a figure; this component is
 * the one place that maps an id to a component, so adding a figure touches the
 * `VisualId` union and this switch and nothing else.
 */
@Component({
  selector: 'app-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GradientDescentVisual,
    ActivationsVisual,
    BiasVarianceVisual,
    ConfusionMatrixVisual,
    TreeSplitsVisual,
    PerceptronVisual,
    NeuralNetVisual,
    ConvolutionVisual,
    TokenizerVisual,
    EmbeddingsVisual,
    AttentionVisual,
    TransformerVisual,
    SamplingVisual,
    RagPipelineVisual,
    VectorSearchVisual,
    AdaptationCompareVisual,
    AgentLoopVisual,
    BackpropVisual,
    TrainingCurveVisual,
    KMeansVisual,
    ThresholdVisual,
  ],
  template: `
    <figure>
      <div class="frame">
        @switch (id()) {
          @case ('gradient-descent') {
            <app-viz-gradient-descent />
          }
          @case ('activations') {
            <app-viz-activations />
          }
          @case ('bias-variance') {
            <app-viz-bias-variance />
          }
          @case ('confusion-matrix') {
            <app-viz-confusion-matrix />
          }
          @case ('tree-splits') {
            <app-viz-tree-splits />
          }
          @case ('perceptron') {
            <app-viz-perceptron />
          }
          @case ('neural-net') {
            <app-viz-neural-net />
          }
          @case ('convolution') {
            <app-viz-convolution />
          }
          @case ('tokenizer') {
            <app-viz-tokenizer />
          }
          @case ('embeddings') {
            <app-viz-embeddings />
          }
          @case ('attention') {
            <app-viz-attention />
          }
          @case ('transformer') {
            <app-viz-transformer />
          }
          @case ('sampling') {
            <app-viz-sampling />
          }
          @case ('rag-pipeline') {
            <app-viz-rag-pipeline />
          }
          @case ('vector-search') {
            <app-viz-vector-search />
          }
          @case ('adaptation-compare') {
            <app-viz-adaptation-compare />
          }
          @case ('agent-loop') {
            <app-viz-agent-loop />
          }
          @case ('backprop') {
            <app-viz-backprop />
          }
          @case ('training-curve') {
            <app-viz-training-curve />
          }
          @case ('kmeans') {
            <app-viz-kmeans />
          }
          @case ('threshold') {
            <app-viz-threshold />
          }
        }
      </div>

      @if (caption()) {
        <figcaption>{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styles: `
    figure {
      margin: 0;
    }

    .frame {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      padding: var(--sp-5);
    }

    figcaption {
      margin-top: var(--sp-2);
      font-size: var(--text-xs);
      color: var(--ink-3);
    }
  `,
})
export class Visual {
  readonly id = input.required<VisualId>();
  readonly caption = input<string>('');
}
